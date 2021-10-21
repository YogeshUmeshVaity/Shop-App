import { NextFunction, Request, Response } from 'express'
import session from 'express-session'
import mongoDbSession from 'connect-mongodb-session'
import { databaseUrl } from '../util/database'
import { User, UserModel } from '../models/User'
import { DocumentType } from '@typegoose/typegoose'
import bcrypt from 'bcryptjs'
import { BeAnObject } from '@typegoose/typegoose/lib/types'
import crypto from 'crypto'
import { promisify } from 'util'
import { PasswordResetError } from '../errors/PasswordResetError'
import { Date } from 'mongoose'
import { emailClient } from '../util/emailClient'

const randomBytesAsync = promisify(crypto.randomBytes)
const ONE_HOUR = 3600000

/**
 * Fetches session secrete from .env file and initializes the express-session.
 */
export const initializeSession = async (
    request: Request,
    response: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const sessionSecret = process.env.SESSION_SECRET
        if (!sessionSecret) throw Error('Express Session Secrete is undefined.')

        const MongoDbStore = mongoDbSession(session)

        const sessionStore = new MongoDbStore({
            uri: databaseUrl(),
            collection: 'sessions'
        })

        // This creates a session middleware and calls it.
        session({
            secret: sessionSecret,
            resave: false,
            saveUninitialized: false,
            store: sessionStore
        })(request, response, next)
        // Do not call next() here. It causes error.
    } catch (error) {
        next(error)
    }
}

export const getLogin = async (
    request: Request,
    response: Response,
    next: NextFunction
): Promise<void> => {
    const errorMessage = extractErrorMessage(request)
    response.render('authentication/login', {
        pageTitle: 'Login',
        routePath: '/login',
        errorMessage: errorMessage
    })
}

export const postLogin = async (
    request: Request,
    response: Response,
    next: NextFunction
): Promise<void> => {
    const email = request.body.email
    const providedPassword = request.body.password
    try {
        const existingUser = await UserModel.findOne({ email })
        if (!existingUser) {
            request.flash('error', 'Invalid email or password.')
            return response.redirect('/login')
        }

        const isMatch = await matchPasswords(providedPassword, existingUser.password)
        if (isMatch) {
            await saveUserToSession(request, existingUser)
            response.redirect('/')
        } else {
            request.flash('error', 'Invalid email or password.')
            response.redirect('/login')
        }
    } catch (error) {
        next(error)
    }
}

export const postLogout = async (request: Request, response: Response): Promise<void> => {
    request.session.destroy((error) => {
        console.log(error)
        response.redirect('/')
    })
}

export const getSignup = async (
    request: Request,
    response: Response,
    next: NextFunction
): Promise<void> => {
    const errorMessage = extractErrorMessage(request)
    response.render('authentication/signup', {
        pageTitle: 'Signup',
        routePath: '/signup',
        errorMessage: errorMessage
    })
}

export const postSignup = async (
    request: Request,
    response: Response,
    next: NextFunction
): Promise<void> => {
    const { name, email, password, confirmPassword } = request.body
    try {
        const existingUser = await UserModel.findOne({ email: email }).exec()
        if (existingUser) {
            request.flash(
                'error',
                'A user with this email already exists. Please, use different email.'
            )
            return response.redirect('/signup')
        }
        const hashedPassword = await bcrypt.hash(password, 12)
        await createNewUser(name, email, hashedPassword)
        // In a very large scale projects where there are huge amount of users signing up,
        // this approach may not be useful, because this statement blocks the execution before
        // they are redirected to the login page.
        await sendWelcomeEmail(email)
        response.redirect('/login')
    } catch (error) {
        next(error)
    }
}

export const getResetPassword = async (
    request: Request,
    response: Response,
    next: NextFunction
): Promise<void> => {
    const errorMessage = extractErrorMessage(request)
    response.render('authentication/reset-password', {
        pageTitle: 'Reset Password',
        routePath: '/reset-password',
        errorMessage: errorMessage
    })
}

export const postResetPassword = async (
    request: Request,
    response: Response,
    next: NextFunction
): Promise<void> => {
    const { email } = request.body
    console.log('email: ', email)
    try {
        // Token is later used for confirming that the password reset link was really sent by us.
        const token = await createResetToken()
        const user = await UserModel.findOne({ email }).exec()
        if (!user) {
            request.flash('error', 'No account was found with the provided email.')
            return response.redirect('/reset-password')
        }

        await saveTokenToDb(user, token)
        sendPasswordResetEmail(user.email, token)
        response.redirect('/')
    } catch (error) {
        if (error instanceof PasswordResetError) {
            return response.redirect('/reset-password')
        } else {
            next(error)
        }
    }
}

export const getNewPassword = async (
    request: Request,
    response: Response,
    next: NextFunction
): Promise<void> => {
    const { token } = request.params
    try {
        const user = await UserModel.findOne({
            resetPasswordToken: token,
            resetPasswordExpiration: { $gt: new Date(Date.now()) }
        })
        if (!user) {
            throw Error('Invalid password reset token')
        }
        const errorMessage = extractErrorMessage(request)
        response.render('authentication/new-password', {
            pageTitle: 'New Password',
            routePath: '/new-password',
            errorMessage: errorMessage,
            userId: user._id.toString()
        })
    } catch (error) {
        next(error)
    }
}

async function saveTokenToDb(user: DocumentType<User, BeAnObject>, token: string) {
    user.resetPasswordToken = token
    user.resetPasswordExpiration = new Date(Date.now() + ONE_HOUR)
    await user.save()
}

async function createResetToken(): Promise<string> {
    let buffer: Buffer
    try {
        buffer = await randomBytesAsync(32)
    } catch (error) {
        console.log(error)
        // TODO: Not sure if it's a good idea not passing the original error object.
        throw new PasswordResetError('Error creating the password reset token.')
    }
    return buffer.toString('hex')
}

//TODO: Need to approve account on postmark website to be able to send emails.
// For that we need a company's domain name. Uncomment the following once the account is approved.
async function sendWelcomeEmail(email: string) {
    // await emailClient.sendEmail({
    //     From: 'ledax86121@forfity.com',
    //     To: email,
    //     Subject: 'Welcome to Hawshop!',
    //     TextBody: 'Signup successful on Hawshop.'
    // })
}

// TODO: extract the localhost url to the environment variable, so you can easily set the production url.
async function sendPasswordResetEmail(email: string, token: string) {
    await emailClient.sendEmail({
        From: 'ledax86121@forfity.com',
        To: email,
        Subject: 'Password reset at Hawshop.',
        HtmlBody: `
            <p>You requested a password reset.</p>
            <p>Click this <a href="http://localhost:3000/reset-password/${token}">link</a> to set a new password.</p>
        `
    })
}

async function matchPasswords(providedPassword: string, existingPassword: string) {
    return await bcrypt.compare(providedPassword, existingPassword)
}

async function saveUserToSession(request: Request, existingUser: DocumentType<User, BeAnObject>) {
    // By setting the user on the session, we share it across requests and is not just valid for
    // this single request.
    request.session.user = existingUser
    request.session.isLoggedIn = true
    // Calling the save() here ensures that the session is stored in the database. It's not
    // required to call save() here, but awaiting for the save ensures that we get redirected
    // only when the session is stored.
    await request.session.save()
}

async function createNewUser(name: string, email: string, hashedPassword: string) {
    const newUser = new UserModel({
        name,
        email,
        password: hashedPassword,
        cart: {
            items: [],
            totalPrice: 0
        }
    })

    await newUser.save()
}

// Extract the error message from the array.
function extractErrorMessage(request: Request): string | null {
    const message = request.flash('error')
    if (message.length > 0) {
        return message[0]
    } else {
        return null
    }
}
