import { database as db } from '../util/database'

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
}
