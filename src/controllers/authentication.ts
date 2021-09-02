import { NextFunction, Request, Response } from 'express'

export const getLogin = async (
    request: Request,
    response: Response,
    next: NextFunction
): Promise<void> => {
    // Extracting the cookie information.
    const isLoggedIn = request.get('Cookie')?.split(';')[0].trim().split('=')[1]
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
    response.setHeader('Set-Cookie', 'loggedIn=true')
    response.redirect('/')
}
