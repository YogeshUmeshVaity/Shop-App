import { NextFunction, Request, Response } from 'express'
import { ProductModel } from '../models/Product'
import { Order, OrderItem, OrderModel } from '../models/Order'
import { DatabaseException } from '../exceptions/HttpExceptions/DatabaseException'
import fs from 'fs'
import path from 'path'
import { FileReadException } from '../exceptions/ReadFileException'
import PDFDocument from 'pdfkit'
import { DocumentType } from '@typegoose/typegoose'

const ITEMS_PER_PAGE = 2

export const getProducts = async (
    request: Request,
    response: Response,
    next: NextFunction
): Promise<void> => {
    try {
        response.render('shop/product-list', {
            productList: await ProductModel.find(),
            pageTitle: 'All Products',
            routePath: '/products'
        })
    } catch (error) {
        next(new DatabaseException(`Unable to retrieve all products from the database.`))
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
        next(new DatabaseException(`Product with ID ${productId} cannot be found.`))
    }
}

export const getIndex = async (
    request: Request,
    response: Response,
    next: NextFunction
): Promise<void> => {
    const page = Number(request.query.page) // Cast it to a Number for calculation purpose.
    try {
        const productsToDisplay = await ProductModel.find()
            .skip((page - 1) * ITEMS_PER_PAGE)
            .limit(ITEMS_PER_PAGE)
            .exec()
        response.render('shop/index', {
            productList: productsToDisplay,
            pageTitle: 'Shop',
            routePath: '/'
        })
    } catch (error) {
        next(new DatabaseException(`Unable to retrieve all products from the database.`))
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
        console.log('User with Cart Products', userWithCartProducts.cart)
        response.render('shop/cart', {
            pageTitle: 'Your Cart',
            routePath: '/cart',
            cartItems: userWithCartProducts.cart.items
        })
    } catch (error) {
        next(new DatabaseException(`Unable to populate cart items for this user.`))
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
            new DatabaseException(`Either the product with that ID was not found or cannot add
                                    the product to the cart.`)
        )
    }
}

export const deleteCartItem = async (
    request: Request,
    response: Response,
    next: NextFunction
): Promise<void> => {
    const productId: string = request.body.itemId
    console.log('Product to delete ID', productId)
    try {
        await request.user.deleteCartItem(productId)
        response.redirect('/cart')
    } catch (error) {
        next(new DatabaseException(`Something went wrong while deleting the cart item.`))
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
        next(new DatabaseException(`Unable to add the order for this user.`))
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
        next(new DatabaseException(`Cannot find the order for this user ID.`))
    }
}

export const getCheckout = (request: Request, response: Response): void => {
    response.render('shop/checkout', {
        pageTitle: 'Checkout',
        routePath: '/checkout'
    })
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
        const invoiceName = 'invoice-' + orderId + '.pdf'
        const invoicePath = path.join(__dirname, '..', 'data', 'invoices', invoiceName)
        createInvoicePDFAndSend(invoicePath, invoiceName, response, order)
    } catch (error) {
        next(error)
    }
}

async function findOrderToCheckAuthorization(
    orderId: string,
    userId: string
): Promise<DocumentType<Order>> {
    try {
        // The check for 'user._id' makes sure only the authorized user has access to invoice.
        return await OrderModel.findOne({ _id: orderId, 'user._id': userId }).orFail().exec()
    } catch (error) {
        throw new DatabaseException(
            'This user is not authorized to access the invoice of this order.'
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
    invoicePDF.on('error', function () {
        throw new FileReadException('Error reading the invoice file.')
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
