import { NextFunction, Request, Response } from 'express'
import { Product, ProductModel } from '../models/Product'
import { Order, OrderItem, OrderModel } from '../models/Order'
import { DatabaseException } from '../exceptions/HttpExceptions/DatabaseException'
import fs from 'fs'
import path from 'path'
import { FileReadException } from '../exceptions/ReadFileException'
import PDFDocument from 'pdfkit'
import { DocumentType } from '@typegoose/typegoose'
import { stripe } from '../util/stripe'
import { PaymentException } from '../exceptions/PaymentExceptions/PaymentException'
import { ifError } from 'assert'
import { Logger } from '../lib/logger'

interface CartItemWithProduct {
    productId: DocumentType<Product>
    quantity: number
}

/**
 * Number of products to be displayed per page on home page, products page and admin products page.
 */
export const ITEMS_PER_PAGE = 12

/**
 * Represents pagination data to be sent to the views for the product list.
 */
interface PaginationData {
    currentPage: number
    hasNextPage: boolean
    hasPreviousPage: boolean
    nextPage: number
    previousPage: number
    lastPage: number
}

export const getProducts = async (
    request: Request,
    response: Response,
    next: NextFunction
): Promise<void> => {
    const currentPage = getPageNumber(request)
    try {
        const productCount = await getProductCount()
        const productsToDisplay = await getProductsToDisplay(currentPage)
        const paginationData = preparePaginationData(currentPage, productCount)
        response.render('shop/product-list', {
            productList: productsToDisplay,
            pageTitle: 'All Products',
            routePath: '/products',
            paginationData: paginationData
        })
    } catch (error) {
        next(error)
    }
}

export const getProductDetails = async (
    request: Request,
    response: Response,
    next: NextFunction
): Promise<void> => {
    const productId = request.params.productId
    try {
        const requestedProduct = await ProductModel.findById(productId).orFail()
        response.render('shop/product-details', {
            product: requestedProduct,
            pageTitle: requestedProduct.title,
            routePath: '/products'
        })
    } catch (error) {
        next(new DatabaseException(`Product with ID ${productId} cannot be found.`, error))
    }
}

export const getIndex = async (
    request: Request,
    response: Response,
    next: NextFunction
): Promise<void> => {
    const currentPage = getPageNumber(request)
    try {
        const productCount = await getProductCount()
        const productsToDisplay = await getProductsToDisplay(currentPage)
        const paginationData = preparePaginationData(currentPage, productCount)
        response.render('shop/index', {
            productList: productsToDisplay,
            pageTitle: 'Shop',
            routePath: '/',
            paginationData: paginationData
        })
    } catch (error) {
        next(error)
    }
}

export const getCart = async (
    request: Request,
    response: Response,
    next: NextFunction
): Promise<void> => {
    try {
        // TODO: App crashes after you navigate to cart when a product is deleted while it's still in the cart.
        // TODO: So, we should delete the product from cart when the it's deleted from the products collection.
        const userWithCartProducts = await request.user
            .populate('cart.items.productId')
            .execPopulate()
        response.render('shop/cart', {
            pageTitle: 'Your Cart',
            routePath: '/cart',
            cartItems: userWithCartProducts.cart.items
        })
    } catch (error) {
        next(new DatabaseException(`Unable to populate cart items for this user.`, error))
    }
}

// TODO: Handle errors separately for findById() and addToCart().
export const postCart = async (
    request: Request,
    response: Response,
    next: NextFunction
): Promise<void> => {
    const newQuantity = 1
    const productId = request.body.productId
    try {
        const product = await ProductModel.findById(productId).orFail().exec()
        await request.user.addToCart(product, newQuantity)
        response.redirect('/cart')
    } catch (error) {
        next(
            new DatabaseException(
                `Either the product with that ID was not found or cannot add
                                    the product to the cart.`,
                error
            )
        )
    }
}

export const deleteCartItem = async (
    request: Request,
    response: Response,
    next: NextFunction
): Promise<void> => {
    const productId: string = request.body.itemId
    Logger.info('Product to delete ID', productId)
    try {
        await request.user.deleteCartItem(productId)
        response.redirect('/cart')
    } catch (error) {
        next(new DatabaseException(`Something went wrong while deleting the cart item.`, error))
    }
}

export const postOrder = async (
    request: Request,
    response: Response,
    next: NextFunction
): Promise<void> => {
    try {
        await OrderModel.addOrder(request.user)
        response.redirect('/orders')
    } catch (error) {
        next(new DatabaseException(`Unable to add the order for this user.`, error))
    }
}

export const getCheckoutSuccess = async (
    request: Request,
    response: Response,
    next: NextFunction
): Promise<void> => {
    try {
        await OrderModel.addOrder(request.user)
        response.redirect('/orders')
    } catch (error) {
        next(new DatabaseException(`Unable to add the order for this user.`, error))
    }
}

export const getOrders = async (
    request: Request,
    response: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const orders = await OrderModel.find({ 'user._id': request.user._id })
        response.render('shop/orders', {
            pageTitle: 'Your Orders',
            routePath: '/orders',
            orders: orders
        })
    } catch (error) {
        next(new DatabaseException(`Cannot find the order for this user ID.`, error))
    }
}

//TODO: Currently there is a flaw in the payment system. The users can visit manually the url
// localhost:3000/checkout/success and place fraudulent orders. So not rely on the success_url.
// Currently we need to manually check the Stripe dashboard, if the payment was successful and only
// then grant the users the goods.
// Use webhooks to know when the payment is really successful and grant the users the goods automatically.
// https://stripe.com/docs/payments/accept-a-payment?platform=web&ui=elements#web-post-payment
export const getCheckout = async (
    request: Request,
    response: Response,
    next: NextFunction
): Promise<void> => {
    try {
        // TODO: App crashes after you navigate to cart when a product is deleted while it's still in the cart.
        // TODO: So, we should delete the product from cart when the it's deleted from the products collection.
        const userWithCartProducts = await populateUserWithCartProducts(request)
        const cartItems = userWithCartProducts.cart.items
        let totalPrice = 0
        cartItems.forEach((item: CartItemWithProduct) => {
            // productId object is of type Product here and not a string.
            totalPrice += item.productId.price * item.quantity
        })

        const session = await createStripePaymentSession(cartItems, request)
        response.render('shop/checkout', {
            pageTitle: 'Checkout',
            routePath: '/checkout',
            cartItems: cartItems,
            totalPrice: totalPrice,
            sessionId: session.id
        })
    } catch (error) {
        next(ifError)
    }
}

export const getInvoice = async (
    request: Request,
    response: Response,
    next: NextFunction
): Promise<void> => {
    const orderId = request.params.orderId
    const userId = request.user._id
    try {
        const order = await findOrderToCheckAuthorization(orderId, userId)
        Logger.info(`Authorization for invoice successful`)
        const invoiceName = 'invoice-' + orderId + '.pdf'
        const invoicePath = path.join(__dirname, '..', 'data', 'invoices', invoiceName)
        createInvoicePDFAndSend(invoicePath, invoiceName, response, order)
    } catch (error) {
        next(error)
    }
}

async function populateUserWithCartProducts(request: Request) {
    try {
        return await request.user.populate('cart.items.productId').execPopulate()
    } catch (error) {
        throw new DatabaseException(`Unable to populate cart items for this user.`, error)
    }
}

//TODO: Currently there is a flaw in the payment system. The users can visit manually the url
// localhost:3000/checkout/success and place fraudulent orders. So not rely on the success_url.
// Currently we need to manually check the Stripe dashboard, if the payment was successful and only
// then grant the users the goods.
// Use webhooks to know when the payment is really successful and grant the users the goods automatically.
// https://stripe.com/docs/payments/accept-a-payment?platform=web&ui=elements#web-post-payment
async function createStripePaymentSession(cartItems: CartItemWithProduct[], request: Request) {
    // eslint-disable-next-line no-useless-catch
    try {
        return await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: cartItems.map((item: CartItemWithProduct) => {
                return {
                    name: item.productId.title,
                    description: item.productId.description,
                    amount: item.productId.price * 100,
                    currency: 'inr',
                    quantity: item.quantity
                }
            }),
            success_url: request.protocol + '://' + request.get('host') + '/checkout/success',
            cancel_url: request.protocol + '://' + request.get('host') + '/checkout/cancel'
        })
    } catch (error) {
        Logger.error(error)
        throw new PaymentException('Something went wrong with payment.', error)
    }
}

function getPageNumber(request: Request): number {
    // Cast it to a Number for calculation purpose.
    // If there is no page number in the route, then the default is 1.
    return Number(request.query.page) || 1
}

async function getProductsToDisplay(page: number): Promise<DocumentType<Product>[]> {
    try {
        return await ProductModel.find()
            .skip((page - 1) * ITEMS_PER_PAGE)
            .limit(ITEMS_PER_PAGE)
            .exec()
    } catch (error) {
        throw new DatabaseException('Unable to fetch the product list.', error)
    }
}

async function getProductCount(): Promise<number> {
    try {
        return await ProductModel.find().countDocuments().exec()
    } catch (error) {
        throw new DatabaseException('Unable to get the product count.', error)
    }
}

// Throws error if not authorized. TODO: better to throw AuthorizationException instead of DatabaseException.
async function findOrderToCheckAuthorization(
    orderId: string,
    userId: string
): Promise<DocumentType<Order>> {
    Logger.info(`orderId: ${orderId}`)
    Logger.info(`userId: ${userId}`)
    try {
        // The check for 'user._id' makes sure only the authorized user has access to invoice.
        return await OrderModel.findOne({ _id: orderId, 'user._id': userId }).orFail().exec()
    } catch (error) {
        Logger.error(error)
        throw new DatabaseException(
            'This user is not authorized to access the invoice of this order.',
            error
        )
    }
}

function createInvoicePDFAndSend(
    invoicePath: string,
    invoiceName: string,
    response: Response,
    order: DocumentType<Order>
) {
    response.setHeader('Content-Type', 'application/pdf')
    // This header causes the file to open inline. Use 'attachment' instead of inline,
    // if you want the file to open as a download.
    response.setHeader('Content-Disposition', 'inline; filename="' + invoiceName + '"')

    // This is a ReadableStream, so we can read from it and write to a WriteStream.
    const invoicePDF = new PDFDocument()

    setErrorHandlerFor(invoicePDF)

    invoicePDF.pipe(fs.createWriteStream(invoicePath)) // Write to the file at invoicePath
    invoicePDF.pipe(response) // Write to the response.

    writeOrderInfoToPDF(invoicePDF, order)
}

// Streams can emit an error event. You can listen for this event to prevent the default
// behavior of throwing the error.
function setErrorHandlerFor(invoicePDF: PDFKit.PDFDocument) {
    invoicePDF.on('error', function (error: unknown) {
        throw new FileReadException('Error reading the invoice file.', error)
    })
}

function writeOrderInfoToPDF(invoicePDF: PDFKit.PDFDocument, order: DocumentType<Order>) {
    // Now whatever we add on the fly to the invoicePDF will be forwarded into the file at
    // invoicePath and also into the response.

    invoicePDF.fontSize(26).text('Invoice', { underline: true, align: 'center' })
    invoicePDF.moveDown()

    let totalPrice = 0
    order.items.forEach((item: OrderItem) => {
        const title = item.product.title
        const quantity = item.quantity
        const price = item.product.price

        totalPrice += quantity * price

        invoicePDF.fontSize(14).text(`${title} - ${quantity} x $${price}`)
    })
    invoicePDF.moveDown()

    invoicePDF.fontSize(20).text(`Total: $${totalPrice}`)

    // Once you are finished writing text call end() to indicate the end of stream.
    invoicePDF.end()
}

export function preparePaginationData(currentPage: number, productCount: number): PaginationData {
    return {
        currentPage: currentPage,
        hasNextPage: ITEMS_PER_PAGE * currentPage < productCount,
        hasPreviousPage: currentPage > 1,
        nextPage: currentPage + 1,
        previousPage: currentPage - 1,
        lastPage: Math.ceil(productCount / ITEMS_PER_PAGE)
    }
}

/**
 * If you read a file like this, node will first of all access that file, read the entire content
 * into the memory and then return it with the response. This means that for bigger files, this will
 * take very long before a response is sent and your memory on the server might actually overflow
 * at some point for many incoming requests because it has to read all the data into memory which
 * of course is limited. So reading file data into memory to serve it as a response is not really
 * a good practice, especially for big files. Use streams as explained in the function above this.
 */
// async function createInvoice(invoiceName: string): Promise<Buffer> {
//     const invoicePath = path.join(__dirname, '..', 'data', 'invoices', invoiceName)
//     try {
//         const buffer = await fs.readFile(invoicePath)
//         return buffer
//     } catch (error) {
//         throw new ReadFileException('Error reading the invoice file.')
//     }
// }
