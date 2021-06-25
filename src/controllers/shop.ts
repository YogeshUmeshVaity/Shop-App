import { Request, Response } from 'express'
import { Product } from '../models/product'
import * as Cart from '../models/cart'

export const getProducts = async (request: Request, response: Response): Promise<void> => {
    const products = await Product.fetchAll()
    response.render('shop/product-list', {
        productList: products,
        pageTitle: 'All Products',
        routePath: '/products'
    })
}

export const getProductDetails = async (request: Request, response: Response): Promise<void> => {
    const productId = request.params.productId
    try {
        const requestedProduct = await Product.findProduct(productId)
        response.render('shop/product-details', {
            product: requestedProduct,
            pageTitle: requestedProduct.title,
            routePath: '/products'
        })
    } catch (error: unknown) {
        if (error instanceof Error) response.redirect('/404')
    }
}

export const getIndex = async (request: Request, response: Response): Promise<void> => {
    const products = await Product.fetchAll()
    response.render('shop/index', {
        productList: products,
        pageTitle: 'Shop',
        routePath: '/'
    })
}

export const getCart = async (request: Request, response: Response): Promise<void> => {
    const cart = await Cart.getCart()
    response.render('shop/cart', {
        pageTitle: 'Your Cart',
        routePath: '/cart',
        cartItems: cart.items
    })
}

export const postCart = async (request: Request, response: Response): Promise<void> => {
    const productId: string = request.body.productId
    try {
        const product = await Product.findProduct(productId)
        Cart.addItem(product, product.price)
        response.redirect('/cart')
    } catch (err) {
        response.redirect('/404')
    }
}

export const deleteCartItem = async (request: Request, response: Response): Promise<void> => {
    const itemId: string = request.body.itemId
    const product = await Product.findProduct(itemId)
    await Cart.removeItem(itemId, product.price)
    response.redirect('/cart')
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
