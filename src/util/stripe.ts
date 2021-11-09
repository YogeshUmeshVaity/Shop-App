import Stripe from 'stripe'
import dotenv from 'dotenv'

function secretAPIKey(): string {
    dotenv.config() // Need to call this, otherwise the env variables become undefined.
    const secretAPIKey = process.env.STRIPE_SECRET_KEY
    if (!secretAPIKey) throw Error('Stripe secret api key is undefined.')
    return secretAPIKey
}

export const stripe = new Stripe(secretAPIKey(), { apiVersion: '2020-08-27' })
