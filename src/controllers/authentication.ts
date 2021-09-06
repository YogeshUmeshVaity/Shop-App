import { NextFunction, Request, Response } from 'express'
import session from 'express-session'

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
        session({ secret: sessionSecret, resave: false, saveUninitialized: false })(
            request,
            response,
            next
        )
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
    // Extracting the cookie information.
    const isLoggedIn = request.get('Cookie')?.split(';')[0].trim().split('=')[1]

    // Print current session object to confirm that the session exists.
    console.log(request.session)

    // If you click login menu and then click login button, this will be `true` (user 1)
    // Now if you open this website and click login menu, this will be 'false' (user 2)
    // This is how we distinguish different users.
    console.log(request.session.isLoggedIn)

    response.render('authentication/login', {
        pageTitle: 'Login',
        routePath: '/login',
        isAuthenticated: isLoggedIn
    })
}

export const postLogin = async (
    request: Request,
    response: Response,
    next: NextFunction
): Promise<void> => {
    // If there were no cookies, this data wouldn't persist once the response is sent.
    // The subsequent requests are brand new requests.
    // request.isLoggedIn = true

    // Once the cookie is set in the browser, the browser automatically sends it back to server
    // with every subsequent request.
    //response.setHeader('Set-Cookie', 'loggedIn=true')

    // We let the session manage the cookie for us automatically, instead of setting the cookie
    // manually in the code above.
    request.session.isLoggedIn = true
    response.redirect('/')
}
