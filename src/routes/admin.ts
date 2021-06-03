import express, { Request, Response } from 'express'
import path from 'path'
import { rootDir } from '../util/path'

export const adminRoutes = express.Router()

adminRoutes.get('/add-product', (request: Request, response: Response) => {
    response.sendFile(path.join(rootDir(), 'views', 'add-product.html'))
})

adminRoutes.post('/product', (request: Request, response: Response) => {
    console.log(request.body)
    response.redirect('/')
})
