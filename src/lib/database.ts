import mongoose from 'mongoose'
import session, { SessionOptions } from 'express-session'
import mongoDbSession from 'connect-mongodb-session'
import { Express } from 'express-serve-static-core'

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

const MongoDbStore = mongoDbSession(session)

export function sessionSecret(): string {
    const sessionSecret = process.env.SESSION_SECRET
    if (!sessionSecret) throw Error('Express Session Secrete is undefined.')
    return sessionSecret
}

// Generally hosting provider configures the SSL/TLS encryption. When we need to manually configure
// the SSL, uncomment the https line and remove the 'app' from app.listen.
// Also don't forget import sslPrivateKey and sslCertificate from util/ssl.ts
export function connectToDatabase(app: Express): void {
    mongoose
        .connect(databaseUrl(), connectOptions)
        .then(() => {
            // https.createServer({ key: sslPrivateKey, cert: sslCertificate }, app)
            app.listen(process.env.PORT || 3000)
        })
        .catch((error) => console.log(error))
}

// export const sessionStore = new MongoDbStore({
//     uri: databaseUrl(),
//     collection: 'sessions'
// })

// export const sessionOptions: SessionOptions = {
//     secret: sessionSecret(),
//     resave: false,
//     saveUninitialized: false,
//     store: sessionStore
// }
