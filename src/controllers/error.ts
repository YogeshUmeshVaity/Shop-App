import { NextFunction, Request, Response } from 'express'
import { FileDeleteException } from '../exceptions/FileExceptions/FileDeleteException'
import { DatabaseException } from '../exceptions/HttpExceptions/DatabaseException'
import { PaymentException } from '../exceptions/PaymentExceptions/PaymentException'
import { FileReadException } from '../exceptions/ReadFileException'
import { Logger } from '../lib/logger'

export const get404 = (request: Request, response: Response): void => {
    response.status(404).render('404', {
        pageTitle: 'Page Not Found',
        routePath: '/404'
    })
}

export const get500 = (request: Request, response: Response): void => {
    response.status(500).render('500', {
        pageTitle: 'Something went wrong.',
        routePath: '/500',
        isAuthenticated: request.session.isLoggedIn
    })
}

export const logErrors = (
    error: unknown,
    request: Request,
    response: Response,
    next: NextFunction
): void => {
    Logger.error(error)
    next(error)
}

export const handleErrors = (
    error: unknown,
    request: Request,
    response: Response,
    next: NextFunction
): void => {
    if (error instanceof DatabaseException) {
        // TODO: Error message could be passed here.
        return response.status(error.status).render('500', {
            pageTitle: 'Something went wrong.',
            routePath: '/500',
            isAuthenticated: request.session.isLoggedIn
        })
    } else if (error instanceof FileReadException) {
        // TODO: Error message could be passed here.
        return response.status(500).render('500', {
            pageTitle: 'Something went wrong.',
            routePath: '/500',
            isAuthenticated: request.session.isLoggedIn
        })
    } else if (error instanceof FileDeleteException) {
        // TODO: Error message could be passed here.
        return response.status(500).render('500', {
            pageTitle: 'Something went wrong.',
            routePath: '/500',
            isAuthenticated: request.session.isLoggedIn
        })
    } else if (error instanceof PaymentException) {
        // TODO: Error message could be passed here.
        return response.status(500).render('500', {
            pageTitle: 'Something went wrong.',
            routePath: '/500',
            isAuthenticated: request.session.isLoggedIn
        })
    } else if (error instanceof Error) {
        // TODO: Error message could be passed here.
        return response.status(500).render('500', {
            pageTitle: 'Something went wrong.',
            routePath: '/500',
            isAuthenticated: request.session.isLoggedIn
        })
    }
    return response.render('500', {
        pageTitle: 'Something went wrong.',
        routePath: '/500',
        isAuthenticated: false // Must be false, because session is undefined for unknown errors.
    })
}
