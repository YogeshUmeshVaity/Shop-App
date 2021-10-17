import { Request, Response } from 'express'

export const get404 = (request: Request, response: Response): void => {
    response.status(404).render('404', {
        pageTitle: 'Page Not Found',
        routePath: '/404'
    })
}
