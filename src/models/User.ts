import { database as db } from '../util/database'
import mongodb from 'mongodb'
import { Cart, CartItem } from './Cart'
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
            (item) => item.product._id.toString() == product._id.toString()
        )

        if (existingItemIndex >= 0) {
            updatedCartItems[existingItemIndex].quantity += newQuantity
        } else {
            updatedCartItems.push({ product: product, quantity: newQuantity })
        }

        const updatedCart: Cart = { items: updatedCartItems, totalPrice: 0 }
        await db()
            .collection('users')
            .updateOne({ _id: new mongodb.ObjectId(user._id) }, { $set: { cart: updatedCart } })
    }
}
