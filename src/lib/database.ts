import session, { SessionOptions } from 'express-session'
import mongoDbSession from 'connect-mongodb-session'

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
