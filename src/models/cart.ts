import { modelOptions, prop, Ref, Severity } from '@typegoose/typegoose'
import { Product } from './Product'

export class CartItem {
    // This is an example of a single reference
    // Writing ref: () => User results in an error
    @prop({ ref: 'Product', required: true })
    productId!: Ref<Product>

    @prop({ required: true })
    quantity!: number
}

@modelOptions({ options: { allowMixed: Severity.ALLOW } })
export class Cart {
    // This is an example of a SubDocument Array
    @prop({ type: () => CartItem, required: true, _id: false }) // specifying type here is important
    items!: CartItem[]

    //TODO: Remove this unused field. The totalPrice is calculated on the fly wherever required.
    @prop({ required: true })
    totalPrice!: number
}
