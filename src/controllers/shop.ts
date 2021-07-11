import { Cart, CartItem } from '@prisma/client'
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

export const getCart = async (
    request: Request,
    response: Response,
    next: NextFunction
): Promise<void> => {
    const userId = request.user?.id
    try {
        const cart = await getCartWithItems(userId)
        response.render('shop/cart', {
            pageTitle: 'Your Cart',
            routePath: '/cart',
            cartItems: cart?.cartItems
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
    const quantity = 1
    const productId = request.body.productId
    const userId = request.user?.id
    try {
        const cart = await findCartFor(userId)
        const existingCartItem = await findExistingItemIn(cart, productId)
        if (existingCartItem) {
            await increaseQuantityOf(existingCartItem, quantity)
        } else {
            await createNewCartItem(productId, cart, quantity)
        }
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
    const itemId: string = request.body.itemId
    const userId = request.user?.id
    try {
        const cart = await findCartFor(userId)
        await ensureIfItemIsFromThisUser(itemId, cart)
        await db.cartItem.delete({ where: { id: itemId } })
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
    const userId = request.user?.id
    try {
        if (!userId) {
            throw Error('User ID is undefined.')
        }

        const cart = await db.cart.findFirst({
            where: {
                userId: userId
            },
            rejectOnNotFound: true,
            include: {
                cartItems: true
            }
        })

        const order = await db.order.create({
            data: {
                userId: userId
            }
        })

        cart.cartItems.forEach(async (cartItem) => {
            await db.orderItem.create({
                data: {
                    productId: cartItem.productId,
                    quantity: cartItem.quantity,
                    orderId: order.id
                }
            })
        })
        await clearTheCart(cart.id)
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
        const userId = getUserId(request)
        const orders = await getOrdersFor(userId)
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

function getUserId(request: Request): string {
    const userId = request.user?.id
    if (!userId) throw Error('User ID is undefined.')
    return userId
}

async function getOrdersFor(userId: string) {
    return await db.order.findMany({
        where: {
            userId: userId
        },
        include: {
            orderItems: {
                include: {
                    product: true
                }
            }
        }
    })
}

async function clearTheCart(cartId: string) {
    await db.cartItem.deleteMany({ where: { cartId: cartId } })
}

// Throws error if the cart-item doesn't belong to this user. This is a safety net.
async function ensureIfItemIsFromThisUser(itemId: string, cart: Cart) {
    return await db.cartItem.findFirst({
        where: {
            AND: [{ id: itemId }, { cartId: cart.id }]
        },
        rejectOnNotFound: true
    })
}

async function createNewCartItem(productId: string, cart: Cart, addedQuantity: number) {
    await db.cartItem.create({
        data: { productId: productId, cartId: cart.id, quantity: addedQuantity }
    })
}

async function increaseQuantityOf(existingCartItem: CartItem, addedQuantity: number) {
    await db.cartItem.update({
        where: { id: existingCartItem.id },
        data: { quantity: existingCartItem.quantity + addedQuantity }
    })
}

async function findExistingItemIn(cart: Cart, productId: string) {
    return await db.cartItem.findFirst({
        where: {
            AND: [{ cartId: cart.id }, { productId: productId }]
        }
    })
}

async function findCartFor(userId: string | undefined) {
    return await db.cart.findFirst({
        where: { userId: userId },
        rejectOnNotFound: true
    })
}

async function getCartWithItems(userId: string | undefined) {
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
