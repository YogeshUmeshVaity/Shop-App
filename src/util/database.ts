import mongodb from 'mongodb'

const MongoClient = mongodb.MongoClient

// TODO: Delete this mongodb code, it's taken care by mongoose
export let _db: mongodb.Db

// TODO: Delete this mongodb code, it's taken care by mongoose
export const connectMongoDb = async (callback: () => void): Promise<void> => {
    try {
        const databaseUrl = process.env.DATABASE_URL
        if (!databaseUrl) throw Error('Database URL is undefined.')
        const client = await MongoClient.connect(databaseUrl, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        })
        _db = client.db()
        callback()
    } catch (error) {
        console.log(error)
        throw error
    }
}

export function databaseUrl(): string {
    const databaseUrl = process.env.DATABASE_URL
    if (!databaseUrl) throw Error('Database URL is undefined.')
    return databaseUrl
}

export const connectOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
}

// TODO: Delete this mongodb code, it's taken care by mongoose
export const database = (): mongodb.Db => {
    if (!_db) throw Error('No database found!')
    return _db
}
