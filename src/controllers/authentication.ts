import { NextFunction, Request, Response } from 'express'

export const getLogin = async (
    request: Request,
    response: Response,
    next: NextFunction
): Promise<void> => {
    response.render('authentication/login', {
        pageTitle: 'Login',
        routePath: '/login'
    })
}
