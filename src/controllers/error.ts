import { NextFunction, Request, Response } from 'express'
import { DatabaseException } from '../exceptions/HttpExceptions/DatabaseException'

export const get404 = (request: Request, response: Response): void => {
    response.status(404).render('404', {
        pageTitle: 'Page Not Found',
        routePath: '/404'
    })
}

export const get500 = (request: Request, response: Response): void => {
    response.status(500).render('500', {
        pageTitle: 'Something went wrong.',
        routePath: '/500'
    })
}

export const handleErrors = (
    error: unknown,
    request: Request,
    response: Response,
    next: NextFunction
): void => {
    if (error instanceof DatabaseException) {
        // TODO: in production, don't use console.log or console.err because it is not async and is very slow. User dedicated loggers.
        console.log(error)
        return response.status(error.status).render('500', {
            pageTitle: 'Something went wrong.',
            routePath: '/500'
        })
    }
    // TODO: This case is not yet handled. Deal with the error of type 'unknown'.
    next(error)
}
