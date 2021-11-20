import mongoose from 'mongoose'
import { Express } from 'express-serve-static-core'
import https from 'https'

export function databaseUrl(): string {
    const databaseUrl = process.env.DATABASE_URL
    if (!databaseUrl) throw Error('Database URL is undefined.')
    return databaseUrl
}

const connectOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
}

export function sessionSecret(): string {
    const sessionSecret = process.env.SESSION_SECRET
    if (!sessionSecret) throw Error('Express Session Secrete is undefined.')
    return sessionSecret
}

// Generally hosting provider configures the SSL/TLS encryption. When we need to manually configure
// the SSL, uncomment the https line and remove the 'app' from app.listen.
// Also don't forget import sslPrivateKey and sslCertificate from util/ssl.ts
export async function connectToDatabase(app: Express): Promise<void> {
    try {
        await mongoose.connect(databaseUrl(), connectOptions)
        app.listen(process.env.PORT || 3000)
    } catch (error) {
        console.log(error)
    }
}
