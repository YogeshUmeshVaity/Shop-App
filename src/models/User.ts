import { DocumentType, getModelForClass, prop } from '@typegoose/typegoose'
import { Logger } from '../lib/logger'
import { Cart } from './Cart'
import { Product } from './Product'

export class User {
    @prop({ required: true })
    name!: string

    @prop({ required: true })
    email!: string

    @prop({ required: true })
    password!: string

    @prop({ required: false })
    resetPasswordToken?: string

    @prop({ required: false })
    resetPasswordExpiration?: Date

    // This is an example of a single SubDocument
    @prop({ required: true, _id: false })
    cart!: Cart

    // Instance method docs: https://typegoose.github.io/typegoose/docs/guides/quick-start-guide/#instance-methods
    public async addToCart(
        this: DocumentType<User>,
        product: DocumentType<Product>,
        newQuantity: number
    ): Promise<void> {
        // TODO: Check if we need to clone the cart instead of directly copying the reference.
        const updatedCartItems = this.cart.items
        const existingItemIndex = this.cart.items.findIndex(
            (item) => item.productId?.toString() === product._id.toString()
        )
        Logger.debug(`Existing Item Index: ${existingItemIndex}`)
        if (existingItemIndex >= 0) {
            updatedCartItems[existingItemIndex].quantity += newQuantity
        } else {
            updatedCartItems.push({ productId: product._id, quantity: newQuantity })
        }
        const updatedCart: Cart = { items: updatedCartItems, totalPrice: 0 }
        Logger.debug('Updated cart: %o', updatedCart)
        this.cart = updatedCart
        Logger.debug("This user's cart: %o", this.cart)
        // this.save() doesn't work for some reason
        await getModelForClass(User).findByIdAndUpdate({ _id: this._id }, { cart: updatedCart })
    }

    public async deleteCartItem(this: DocumentType<User>, productId: string): Promise<void> {
        await this.updateOne({ $pull: { 'cart.items': { productId: productId } } })
    }
}

export const UserModel = getModelForClass(User)
