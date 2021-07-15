import { database as db } from '../util/database'
import mongodb from 'mongodb'

export class User {
    constructor(public name: string, public email: string) {}

    async save(): Promise<void> {
        await db().collection('users').insertOne(this)
    }

    static async findById(id: string): Promise<User> {
        return await db()
            .collection('users')
            .findOne({ _id: new mongodb.ObjectId(id) })
    }
}
