import { NextFunction, Request, Response } from 'express'
import { ProductModel as Product } from '../models/Product'
import { User } from '../models/User'

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
    const user = request.user
    try {
        const product = await Product.findById(productId).orFail()
        await user.addToCart(product, newQuantity)
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
    
    // try {
    //     await User.deleteCartItem(productId, request.user)
    //     response.redirect('/cart')
    // } catch (error) {
    //     next(error)
    // }
}

export const postOrder = async (
    request: Request,
    response: Response,
    next: NextFunction
): Promise<void> => {
    // try {
    //     await User.addOrder(request.user)
    //     response.redirect('/orders')
    // } catch (error) {
    //     next(error)
    // }
}

export const getOrders = async (
    request: Request,
    response: Response,
    next: NextFunction
): Promise<void> => {
    // try {
    //     const orders = await User.getOrders(request.user)
    //     response.render('shop/orders', {
    //         pageTitle: 'Your Orders',
    //         routePath: '/orders',
    //         orders: orders
    //     })
    // } catch (error) {
    //     next(error)
    // }
}

export const getCheckout = (request: Request, response: Response): void => {
    response.render('shop/checkout', {
        pageTitle: 'Checkout',
        routePath: '/checkout'
    })
}

// function moveCartItemsToNewOrder(cart: CartWithItems, newOrder: Order) {
//     cart.cartItems.forEach(async (cartItem) => {
//         await db.orderItem.create({
//             data: {
//                 productId: cartItem.productId,
//                 quantity: cartItem.quantity,
//                 orderId: newOrder.id
//             }
//         })
//     })
// }

// async function createNewOrder(userId: string) {
//     return await db.order.create({
//         data: {
//             userId: userId
//         }
//     })
// }

function getUserIdFrom(request: Request): string {
    const userId = request.user?.id
    if (!userId) throw Error('User ID is undefined.')
    return userId
}

// async function getOrdersFor(userId: string) {
//     return await db.order.findMany({
//         where: {
//             userId: userId
//         },
//         include: {
//             orderItems: {
//                 include: {
//                     product: true
//                 }
//             }
//         }
//     })
// }

// async function clearTheCart(cartId: string) {
//     await db.cartItem.deleteMany({ where: { cartId: cartId } })
// }

// Throws error if the cart-item doesn't belong to this user. This is a safety net.
// async function ensureIfItemIsFromThisUser(itemId: string, cart: Cart) {
//     return await db.cartItem.findFirst({
//         where: {
//             AND: [{ id: itemId }, { cartId: cart.id }]
//         },
//         rejectOnNotFound: true
//     })
// }

// async function createNewCartItem(productId: string, cart: Cart, addedQuantity: number) {
//     await db.cartItem.create({
//         data: { productId: productId, cartId: cart.id, quantity: addedQuantity }
//     })
// }

// async function increaseQuantityOf(existingCartItem: CartItem, addedQuantity: number) {
//     await db.cartItem.update({
//         where: { id: existingCartItem.id },
//         data: { quantity: existingCartItem.quantity + addedQuantity }
//     })
// }

// async function findExistingItemIn(cart: Cart, productId: string) {
//     return await db.cartItem.findFirst({
//         where: {
//             AND: [{ cartId: cart.id }, { productId: productId }]
//         }
//     })
// }

// async function findCartFor(userId: string) {
//     return await db.cart.findFirst({
//         where: { userId: userId },
//         rejectOnNotFound: true
//     })
// }

// async function getCartWithItems(userId: string) {
//     return await db.cart.findFirst({
//         where: { userId: userId },
//         include: {
//             cartItems: {
//                 include: {
//                     product: true
//                 }
//             }
//         },
//         rejectOnNotFound: true
//     })
// }
