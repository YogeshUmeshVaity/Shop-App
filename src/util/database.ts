import mongodb from 'mongodb'

const MongoClient = mongodb.MongoClient

export const mongoConnect = async (
    callback: (arg0: mongodb.MongoClient) => void
): Promise<void> => {
    try {
        const databaseUrl = process.env.DATABASE_URL
        if (!databaseUrl) throw Error('Database URL is undefined.')
        const client = await MongoClient.connect(databaseUrl, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        })
        callback(client)
    } catch (error) {
        console.log(error)
    }
}
