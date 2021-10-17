import { NextFunction, Request, Response } from 'express'
import session from 'express-session'
import mongoDbSession from 'connect-mongodb-session'
import { databaseUrl } from '../util/database'
import { User, UserModel } from '../models/User'
import { DocumentType } from '@typegoose/typegoose'
import bcrypt from 'bcryptjs'
import { BeAnObject } from '@typegoose/typegoose/lib/types'

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
    // If you click login menu and then click login button, this will be `true` (user 1)
    // Now if you open this website and click login menu, this will be 'false' (user 2)
    // This is how we distinguish different users.
    console.log(request.session.isLoggedIn)

    response.render('authentication/login', {
        pageTitle: 'Login',
        routePath: '/login',
        errorMessage: request.flash('error')
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
    response.render('authentication/signup', {
        pageTitle: 'Signup',
        routePath: '/signup'
    })
}

export const postSignup = async (
    request: Request,
    response: Response,
    next: NextFunction
): Promise<void> => {
    const { name, email, password, confirmPassword } = request.body
    try {
        const existingUser = await UserModel.findOne({ email: email })
        if (existingUser) {
            return response.redirect('/signup')
        }
        const hashedPassword = await bcrypt.hash(password, 12)
        await createNewUser(name, email, hashedPassword)
        response.redirect('/login')
    } catch (error) {
        next(error)
    }
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
