import { NextFunction, Request, Response } from 'express'
import { db } from '../util/database'

export const getProducts = async (
    request: Request,
    response: Response,
    next: NextFunction
): Promise<void> => {
    // try {
    //     response.render('shop/product-list', {
    //         productList: await Product.findAll(),
    //         pageTitle: 'All Products',
    //         routePath: '/products'
    //     })
    // } catch (error) {
    //     next(error)
    // }
}

export const getProductDetails = async (
    request: Request,
    response: Response,
    next: NextFunction
): Promise<void> => {
    // const productId = request.params.productId
    // try {
    //     const requestedProduct = await Product.findByPk(productId, { rejectOnEmpty: true })
    //     response.render('shop/product-details', {
    //         product: requestedProduct,
    //         pageTitle: requestedProduct.title,
    //         routePath: '/products'
    //     })
    // } catch (error) {
    //     next(error)
    // }
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
    // const cart = await Cart.getCart()
    // response.render('shop/cart', {
    //     pageTitle: 'Your Cart',
    //     routePath: '/cart',
    //     cartItems: cart.items
    // })
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

async function testDatabase() {
    // const result = await database.execute('SELECT * FROM products')
    // console.log('From database', JSON.parse(JSON.stringify(result[0])))
    // const allProducts: Array<Product> = JSON.parse(JSON.stringify(result[0]))
    // allProducts[0].id
}
