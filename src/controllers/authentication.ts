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
import { PasswordResetException } from '../exceptions/PasswordResetError'
import { emailClient } from '../util/emailClient'
import { DatabaseException } from '../exceptions/HttpExceptions/DatabaseException'

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
        next(new DatabaseException(`Unable to create the express-session.`))
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
        errorMessage: errorMessage,
        oldInput: { email: '', password: '' },
        validationErrors: []
    })
}

// TODO: Find a way to handle errors separately for findOne() and matchPassword().
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
            return response.status(422).render('authentication/login', {
                pageTitle: 'Login',
                routePath: '/login',
                errorMessage: 'Invalid email or password.',
                oldInput: { email: email, password: providedPassword },
                validationErrors: [
                    /* { param: 'email', OR param: 'password' } */
                ]
            })
        }

        const isMatch = await matchPasswords(providedPassword, existingUser.password)
        if (isMatch) {
            await saveUserToSession(request, existingUser)
            response.redirect('/')
        } else {
            response.status(422).render('authentication/login', {
                pageTitle: 'Login',
                routePath: '/login',
                errorMessage: 'Invalid email or password.',
                oldInput: { email: email, password: providedPassword },
                validationErrors: [
                    /* { param: 'email', OR param: 'password' } */
                ]
            })
        }
    } catch (error) {
        next(
            new DatabaseException(
                `Problem retrieving the user from the database or matching the passwords`
            )
        )
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
        errorMessage: errorMessage,
        oldInput: { name: '', email: '', password: '', confirmPassword: '' },
        validationErrors: []
    })
}

// TODO: Find a way to handle errors separately for hashThe() and createNewUser(). See what expceptions
// each of these functions throw.
export const postSignup = async (
    request: Request,
    response: Response,
    next: NextFunction
): Promise<void> => {
    const { name, email, password } = request.body
    try {
        const hashedPassword = await hashThe(password)
        await createNewUser(name, email, hashedPassword)
        // In a very large scale projects where there are huge amount of users signing up,
        // this approach may not be useful, because this statement blocks the execution before
        // they are redirected to the login page.
        await sendWelcomeEmail(email)
        response.redirect('/login')
    } catch (error) {
        next(new DatabaseException(`Problem while hashing password or saving the user to database`))
    }
}

export const getResetPassword = async (request: Request, response: Response): Promise<void> => {
    const errorMessage = extractErrorMessage(request)
    response.render('authentication/reset-password', {
        pageTitle: 'Reset Password',
        routePath: '/reset-password',
        errorMessage: errorMessage
    })
}

/**
 * Token is later used for confirming that the password reset link we sent in the email was really
 * sent by us. This is like the csrf protection. We also save the expiry time in the database for
 * this token. Expiry time ensures that this token is only valid in a certain time frame better for
 * security.
 *
 * // TODO: Find a way to handle errors separately for findOne() and saveTokenToDb() and
 * // sendPasswordResetEmail(). See what exceptions each of these functions throw.
 */
export const postResetPassword = async (
    request: Request,
    response: Response,
    next: NextFunction
): Promise<void> => {
    const { email } = request.body
    console.log('email: ', email)
    try {
        const token = await createResetToken()
        const user = await UserModel.findOne({ email }).exec()
        if (!user) {
            request.flash('error', 'No account was found with the provided email.')
            return response.redirect('/reset-password')
        }

        await saveTokenToDb(user, token)
        await sendPasswordResetEmail(user.email, token)
        response.redirect('/')
    } catch (error) {
        if (error instanceof PasswordResetException) {
            return response.redirect('/reset-password')
        } else {
            next(new DatabaseException(`Something went wrong while resetting the password.`))
        }
    }
}

/**
 * In addition to the token, we also pass the userId. This makes sure that the attackers can't
 * automate trying random tokens in the address bar and reach the new password page. They also need
 * userId.
 */
export const getNewPassword = async (
    request: Request,
    response: Response,
    next: NextFunction
): Promise<void> => {
    const { resetPasswordToken } = request.params
    try {
        const user = await verifyUserWithToken(resetPasswordToken)
        const errorMessage = extractErrorMessage(request)
        response.render('authentication/new-password', {
            pageTitle: 'New Password',
            routePath: '/new-password',
            errorMessage: errorMessage,
            userId: user._id.toString(),
            resetPasswordToken: resetPasswordToken
        })
    } catch (error) {
        next(
            new DatabaseException(`Unable to verify the authenticity of the password reset token.`)
        )
    }
}

// TODO: Handle error for hashThe() function separately.
export const postNewPassword = async (
    request: Request,
    response: Response,
    next: NextFunction
): Promise<void> => {
    const { userId, newPassword, resetPasswordToken } = request.body
    try {
        const user = await verifyUserWithTokenAndId(resetPasswordToken, userId)
        const hashedPassword = await hashThe(newPassword)
        await savePasswordAndDeleteToken(user, hashedPassword)
        response.redirect('/login')
    } catch (error) {
        next(
            new DatabaseException(`Unable to verify the authenticity of the password reset token.`)
        )
    }
}

async function savePasswordAndDeleteToken(
    user: DocumentType<User, BeAnObject>,
    hashedPassword: string
) {
    user.password = hashedPassword
    user.resetPasswordToken = undefined
    user.resetPasswordExpiration = undefined
    await user.save()
}

async function hashThe(password: string) {
    return await bcrypt.hash(password, 12)
}

async function verifyUserWithToken(token: string): Promise<DocumentType<User, BeAnObject>> {
    const user = await UserModel.findOne({
        resetPasswordToken: token,
        resetPasswordExpiration: { $gt: new Date(Date.now()) }
    })
    if (!user) {
        throw Error('Invalid password reset token')
    }
    return user
}

async function verifyUserWithTokenAndId(
    token: string,
    userId: string
): Promise<DocumentType<User, BeAnObject>> {
    const user = await UserModel.findOne({
        resetPasswordToken: token,
        resetPasswordExpiration: { $gt: new Date(Date.now()) },
        _id: userId
    })
    if (!user) {
        throw Error('Invalid password reset token')
    }
    return user
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
        throw new PasswordResetException('Error creating the password reset token.')
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
        From: 'xobay85451@ateampc.com',
        To: email,
        Subject: 'Password reset at Hawshop.',
        HtmlBody: `
            <p>You requested a password reset.</p>
            <p>Click this <a href="http://localhost:3000/reset-password/${token}">link</a> to set a new password.</p>
            <p>For security reasons, this link is valid only for an hour.</p>
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
