import { NextFunction, Request, Response } from 'express'
import { DatabaseException } from '../exceptions/DatabaseException'

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
        return response.status(error.status).render('500', {
            pageTitle: 'Something went wrong.',
            routePath: '/500'
        })
    }
    // TODO: This case is not yet handled. Either remove this or deal with the error of type 'unknown'.
    next(error)
}
