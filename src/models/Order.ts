import {
    DocumentType,
    getModelForClass,
    modelOptions,
    prop,
    Ref,
    Severity
} from '@typegoose/typegoose'
import { BeAnObject } from '@typegoose/typegoose/lib/types'
import { Types } from 'mongoose'
import { Product } from './Product'
import { User } from './User'

export class OrderItem {
    // This is an example of a single reference
    // Writing ref: () => User results in an error
    @prop({ required: true })
    product!: Product

    @prop({ required: true })
    quantity!: number
}

@modelOptions({ options: { allowMixed: Severity.ALLOW } })
export class Order {
    // This is an example of a SubDocument Array
    @prop({ type: () => OrderItem, required: true, _id: false }) // specifying type here is important
    items!: OrderItem[]

    @prop({ required: true })
    totalPrice!: number

    @prop({ required: true })
    user!: User

    static async addOrder(user: DocumentType<User>): Promise<void> {
        const userWithCartProducts = await user.populate('cart.items.productId').execPopulate()
        const orderItems = extractOrderItems(userWithCartProducts)
        await createOrder(orderItems, userWithCartProducts, user)
        await clearTheCart(user)
    }
}

export const OrderModel = getModelForClass(Order)

type PopulatedOrderItems = {
    product: Ref<Product, Types.ObjectId | undefined>
    quantity: number
}

function extractOrderItems(userWithCartProducts: DocumentType<User, BeAnObject>) {
    return userWithCartProducts.cart.items.map((item) => {
        return { product: item.productId, quantity: item.quantity }
    })
}

async function createOrder(
    orderItems: PopulatedOrderItems[],
    userWithCartProducts: DocumentType<User, BeAnObject>,
    user: DocumentType<User, BeAnObject>
) {
    await getModelForClass(Order).create({
        items: orderItems,
        totalPrice: userWithCartProducts.cart.totalPrice,
        user: user
    })
}

async function clearTheCart(user: DocumentType<User>) {
    await user.updateOne({ 'cart.items': [] })
}
