import { NextFunction, Request, Response } from 'express'
import { ProductModel as Product } from '../models/Product'
import { OrderModel as Order } from '../models/Order'
import { DatabaseException } from '../exceptions/HttpExceptions/DatabaseException'
import fs from 'fs/promises'
import path from 'path'

export const getProducts = async (
    request: Request,
    response: Response,
    next: NextFunction
): Promise<void> => {
    try {
        response.render('shop/product-list', {
            productList: await Product.find(),
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
        const requestedProduct = await Product.findById(productId).orFail()
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
    try {
        response.render('shop/index', {
            productList: await Product.find(),
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
        const product = await Product.findById(productId).orFail().exec()
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
        await Order.addOrder(request.user)
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
        const orders = await Order.find({ 'user._id': request.user._id })
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
    const invoiceName = 'invoice-' + orderId + '.pdf'
    const invoicePath = path.join(__dirname, '..', 'data', 'invoices', invoiceName)
    console.log(invoicePath)
    try {
        const invoiceData = await fs.readFile(invoicePath)
        response.send(invoiceData)
    } catch (error) {
        next(new Error('Error reading the invoice file.'))
    }
}
