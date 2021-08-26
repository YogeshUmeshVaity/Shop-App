import { getModelForClass, modelOptions, prop, Ref, Severity } from '@typegoose/typegoose'

// @modelOptions({ schemaOptions: { timestamps: true }, options: { customName: 'products' } })
class Product {
    @prop()
    title!: string

    @prop()
    price!: number

    @prop()
    description?: string

    @prop()
    imageUrl!: string
}

class CartItem {
    @prop()
    product!: Ref<Product>

    @prop()
    quantity!: number
}

@modelOptions({ options: { allowMixed: Severity.ALLOW } })
class Cart {
    @prop()
    items?: CartItem[]

    @prop()
    totalPrice = 0
}

class User {
    @prop()
    name!: string

    @prop()
    email!: string

    @prop({ _id: false })
    cart?: Cart
}

export const ProductModel = getModelForClass(Product)
export const UserModel = getModelForClass(User)

// import { Schema, Document } from 'mongoose'
// import mongoose from 'mongoose'

// interface IProduct extends Document {
//     title: string
//     price: number
//     description: string
//     imageUrl: string
//     // createdByUserId: string
// }

// const ProductSchema: Schema = new Schema(
//     {
//         title: { type: String, required: true },
//         price: { type: Number, required: true },
//         description: { type: String, required: true },
//         imageUrl: { type: String, required: true }
//         // createdByUserId: { type: String, required: true }
//     },
//     {
//         timestamps: true
//     }
// )

// export default mongoose.model<IProduct>('Product', ProductSchema)

// export class Product {
//     _id!: string
//     constructor(
//         public title: string,
//         public price: number,
//         public description: string,
//         public imageUrl: string,
//         public userId: string
//     ) {}

//     static async save(newProduct: Product): Promise<void> {
//         try {
//             await db().collection('products').insertOne(newProduct)
//         } catch (error) {
//             console.log(error)
//             throw error
//         }
//     }

//     static async findAll(): Promise<Product[]> {
//         const products: Product[] = await db().collection('products').find().toArray()
//         return products
//     }

//     static async findById(id: string): Promise<Product> {
//         return await db()
//             .collection('products')
//             .find({ _id: new mongodb.ObjectId(id) })
//             .next()
//     }

//     static async update(
//         id: string,
//         title: string,
//         price: number,
//         description: string,
//         imageUrl: string
//     ): Promise<void> {
//         await db()
//             .collection('products')
//             .updateOne(
//                 { _id: new mongodb.ObjectID(id) },
//                 {
//                     $set: {
//                         title: title,
//                         price: price,
//                         description: description,
//                         imageUrl: imageUrl
//                     }
//                 }
//             )
//     }

//     static async deleteById(id: string): Promise<void> {
//         await db()
//             .collection('products')
//             .deleteOne({ _id: new mongodb.ObjectID(id) })
//     }
// }
