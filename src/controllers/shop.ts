import { NextFunction, Request, Response } from 'express'
import { db } from '../util/database'

export const getProducts = async (
    request: Request,
    response: Response,
    next: NextFunction
): Promise<void> => {
    try {
        response.render('shop/product-list', {
            productList: await db.product.findMany(),
            pageTitle: 'All Products',
            routePath: '/products'
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
        const requestedProduct = await db.product.findUnique({
            where: { id: productId },
            rejectOnNotFound: true
        })
        response.render('shop/product-details', {
            product: requestedProduct,
            pageTitle: requestedProduct.title,
            routePath: '/products'
        })
    } catch (error) {
        next(error)
    }
}

export const getIndex = async (
    request: Request,
    response: Response,
    next: NextFunction
): Promise<void> => {
    try {
        response.render('shop/index', {
            productList: await db.product.findMany(),
            pageTitle: 'Shop',
            routePath: '/'
        })
    } catch (error) {
        next(error)
    }
}

export const getCart = async (request: Request, response: Response): Promise<void> => {
    const userId = request.user?.id
    const cart = await getCartFor(userId)
    response.render('shop/cart', {
        pageTitle: 'Your Cart',
        routePath: '/cart',
        cartItems: cart?.cartItems
    })
}

export const postCart = async (request: Request, response: Response): Promise<void> => {
    // const productId: string = request.body.productId
    // try {
    //     const product = await Product.findProduct(productId)
    //     Cart.addItem(product, product.price)
    //     response.redirect('/cart')
    // } catch (err) {
    //     response.redirect('/404')
    // }
}

export const deleteCartItem = async (request: Request, response: Response): Promise<void> => {
    // const itemId: string = request.body.itemId
    // const product = await Product.findProduct(itemId)
    // await Cart.removeItem(itemId, product.price)
    // response.redirect('/cart')
}

export const getOrders = (request: Request, response: Response): void => {
    response.render('shop/orders', {
        pageTitle: 'Your Orders',
        routePath: '/orders'
    })
}

export const getCheckout = (request: Request, response: Response): void => {
    response.render('shop/checkout', {
        pageTitle: 'Checkout',
        routePath: '/checkout'
    })
}

async function getCartFor(userId: string | undefined) {
    return await db.cart.findFirst({
        where: { userId: userId },
        include: {
            cartItems: {
                include: {
                    product: true
                }
            }
        }
    })
}
