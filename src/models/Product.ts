import { database as db } from '../util/database'
import mongodb from 'mongodb'

export class Product {
    title: string
    price: number
    description: string
    imageUrl: string

    constructor(title: string, price: number, description: string, imageUrl: string) {
        this.title = title
        this.price = price
        this.description = description
        this.imageUrl = imageUrl
    }

    async save(): Promise<void> {
        try {
            await db().collection('products').insertOne(this)
        } catch (error) {
            console.log(error)
            throw error
        }
    }

    static async findAll(): Promise<Product[]> {
        const products: Product[] = await db().collection('products').find().toArray()
        return products
    }

    static async findById(id: string): Promise<Product> {
        return await db()
            .collection('products')
            .find({ _id: new mongodb.ObjectId(id) })
            .next()
    }

    static async update(
        id: string,
        title: string,
        price: number,
        description: string,
        imageUrl: string
    ): Promise<void> {
        await db()
            .collection('products')
            .updateOne(
                { _id: new mongodb.ObjectID(id) },
                {
                    $set: {
                        title: title,
                        price: price,
                        description: description,
                        imageUrl: imageUrl
                    }
                }
            )
    }

    static async deleteById(id: string): Promise<void> {
        await db()
            .collection('products')
            .deleteOne({ _id: new mongodb.ObjectID(id) })
    }
}
