import * as postmark from 'postmark'
import dotenv from 'dotenv'

function serverToken(): string {
    dotenv.config() // Need to call this, otherwise the env variables become undefined.
    const serverToken = process.env.POSTMARK_SERVER_TOKEN
    if (!serverToken) throw Error('Server token of postmark email service is undefined.')
    return serverToken
}

export const emailClient = new postmark.ServerClient(serverToken())
