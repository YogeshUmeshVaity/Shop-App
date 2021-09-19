import { NextFunction, Request, Response } from 'express'
import session from 'express-session'
//import { sessionOptions } from '../util/database'
import mongoDbSession from 'connect-mongodb-session'
import { databaseUrl } from '../util/database'
import { User, UserModel } from '../models/User'
import { DocumentType } from '@typegoose/typegoose'

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
        isAuthenticated: request.session.isLoggedIn
    })
}

export const postLogin = async (
    request: Request,
    response: Response,
    next: NextFunction
): Promise<void> => {
    try {
        // By setting the user on the session, we share it across requests and is not just valid for
        // this single request.
        request.session.user = await UserModel.findById('6127bd9d204a47128947a07d').orFail().exec()
        request.session.isLoggedIn = true
        response.redirect('/')
    } catch (error) {
        next(error)
    }
}
