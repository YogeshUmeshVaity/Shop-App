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
            routePath: '/products',
            isAuthenticated: request.session.isLoggedIn
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
            routePath: '/products',
            isAuthenticated: request.session.isLoggedIn
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
            routePath: '/',
            isAuthenticated: request.session.isLoggedIn
        })
    } catch (error) {
        next(error)
    }
}

// TODO: App crashes after you navigate to cart when a product is deleted and while it's in the cart
export const getCart = async (
    request: Request,
    response: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const user = await User.findById(request.session.user._id).orFail().exec()
        const userWithCartProducts = await user.populate('cart.items.productId').execPopulate()
        console.log('User with Cart Products', userWithCartProducts.cart)
        response.render('shop/cart', {
            pageTitle: 'Your Cart',
            routePath: '/cart',
            cartItems: userWithCartProducts.cart.items,
            isAuthenticated: request.session.isLoggedIn
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
        const user = await User.findById(request.session.user._id).orFail().exec()
        const product = await Product.findById(productId).orFail().exec()
        await User.addToCart(user, product, newQuantity)
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
        const user = await User.findById(request.session.user._id).orFail().exec()
        await user.deleteCartItem(productId)
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
        const user = await User.findById(request.session.user._id).orFail().exec()
        await Order.addOrder(user)
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
        const orders = await Order.find({ 'user._id': request.session.user._id })
        response.render('shop/orders', {
            pageTitle: 'Your Orders',
            routePath: '/orders',
            orders: orders,
            isAuthenticated: request.session.isLoggedIn
        })
    } catch (error) {
        next(error)
    }
}

export const getCheckout = (request: Request, response: Response): void => {
    response.render('shop/checkout', {
        pageTitle: 'Checkout',
        routePath: '/checkout',
        isAuthenticated: request.session.isLoggedIn
    })
}
