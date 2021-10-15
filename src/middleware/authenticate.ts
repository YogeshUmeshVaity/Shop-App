import { NextFunction, Request, Response } from 'express'

export const authenticate = (request: Request, response: Response, next: NextFunction): void => {
    if (!request.session.isLoggedIn) {
        response.redirect('/login')
    }
    next()
}
