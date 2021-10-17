import { NextFunction, Request, Response } from 'express'
import { ProductModel as Product } from '../models/Product'
import { OrderModel as Order } from '../models/Order'
import { UserModel as User } from '../models/User'

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
        const requestedProduct = await Product.findById(productId).orFail()
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
            productList: await Product.find(),
            pageTitle: 'Shop',
            routePath: '/'
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
        console.log('User with Cart Products', userWithCartProducts.cart)
        response.render('shop/cart', {
            pageTitle: 'Your Cart',
            routePath: '/cart',
            cartItems: userWithCartProducts.cart.items
        })
    } catch (error) {
        next(error)
    }
}

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
        next(error)
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
        next(error)
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
        next(error)
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
        next(error)
    }
}

export const getCheckout = (request: Request, response: Response): void => {
    response.render('shop/checkout', {
        pageTitle: 'Checkout',
        routePath: '/checkout'
    })
}
