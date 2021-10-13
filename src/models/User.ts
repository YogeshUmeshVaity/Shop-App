import { DocumentType, getModelForClass, prop } from '@typegoose/typegoose'
import { Cart } from './Cart'
import { Product } from './Product'

export class User {
    @prop({ required: true })
    name!: string

    @prop({ required: true })
    email!: string

    // This is an example of a single SubDocument
    @prop({ required: true, _id: false })
    cart!: Cart

    // Instance method docs: https://typegoose.github.io/typegoose/docs/guides/quick-start-guide/#instance-methods
    public async addToCart(
        this: DocumentType<User>,
        product: DocumentType<Product>,
        newQuantity: number
    ): Promise<void> {
        const updatedCartItems = this.cart.items
        const existingItemIndex = this.cart.items.findIndex(
            (item) => item.productId?.toString() === product._id.toString()
        )
        console.log('Existing Item Index', existingItemIndex)
        if (existingItemIndex >= 0) {
            updatedCartItems[existingItemIndex].quantity += newQuantity
        } else {
            updatedCartItems.push({ productId: product._id, quantity: newQuantity })
        }
        const updatedCart: Cart = { items: updatedCartItems, totalPrice: 0 }
        console.log('Updated cart:', updatedCart)
        this.cart = updatedCart
        console.log('This user cart', this.cart)
        // this.save() doesn't work for some reason
        await getModelForClass(User).findByIdAndUpdate({ _id: this._id }, { cart: updatedCart })
    }

    public async deleteCartItem(this: DocumentType<User>, productId: string): Promise<void> {
        await this.updateOne({ $pull: { 'cart.items': { productId: productId } } })
    }
}

export const UserModel = getModelForClass(User)
