import { connectMongoDb, database as db } from '../util/database'
import mongodb from 'mongodb'

export class User {
    name: string
    email: string

    constructor(name: string, email: string) {
        this.name = name
        this.email = email
    }

    async save(): Promise<void> {
        await db().collection('users').insertOne(this)
    }

    static async findById(id: string): Promise<User> {
        return await db()
            .collection('users')
            .findOne({ _id: new mongodb.ObjectId(id) })
    }
}
