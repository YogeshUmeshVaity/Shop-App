import { database as db } from '../util/database'
import mongodb from 'mongodb'
import { Cart, CartItem, CartItemWithProduct, CartWithProducts } from './Cart'
import { Product } from './Product'

export class User {
    _id!: string
    constructor(public name: string, public email: string, public cart: Cart) {}

    async save(): Promise<void> {
        await db().collection('users').insertOne(this)
    }

    static async findById(id: string): Promise<User> {
        return await db()
            .collection('users')
            .findOne({ _id: new mongodb.ObjectId(id) })
    }

    static async addToCart(product: Product, newQuantity: number, user: User): Promise<void> {
        const updatedCartItems: CartItem[] = user.cart.items

        const existingItemIndex = user.cart.items.findIndex(
            (item) => item.productId.toString() === product._id.toString()
        )

        if (existingItemIndex >= 0) {
            updatedCartItems[existingItemIndex].quantity += newQuantity
        } else {
            updatedCartItems.push({ productId: product._id, quantity: newQuantity })
        }

        const updatedCart: Cart = { items: updatedCartItems, totalPrice: 0 }
        await db()
            .collection('users')
            .updateOne({ _id: new mongodb.ObjectId(user._id) }, { $set: { cart: updatedCart } })
    }

    static async getCart(user: User): Promise<CartWithProducts> {
        const cartProductIds = user.cart.items.map((items) => items.productId)
        const cartProducts: Array<Product> = await db()
            .collection('products')
            .find({ _id: { $in: cartProductIds } })
            .toArray()
        const cartItems = cartProducts.map((product) => {
            let quantity = user.cart.items.find((cartItem) => {
                return cartItem.productId.toString() === product._id.toString()
            })?.quantity
            if (!quantity) quantity = 0
            return {
                product: { ...product },
                quantity: quantity
            }
        })

        console.log({ items: [...cartItems], totalPrice: 0 })
        return { items: [...cartItems], totalPrice: 0 }
    }

    static async deleteCartItem(productId: string, user: User): Promise<void> {
        console.log('Inside deleteCartItem() controller')
        const result = await db()
            .collection('users')
            .updateOne(
                { _id: new mongodb.ObjectId(user._id) },
                { $pull: { 'cart.items': { productId: new mongodb.ObjectId(productId) } } }
            )
        console.log('Delete result', result)
    }
}