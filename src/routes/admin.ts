import express, { Request, Response } from 'express'
import path from 'path'
import { rootDirectory } from '../util/path'
import { Product } from '../models/product'

export const adminRoutes = express.Router()
export const products: Array<Product> = []

adminRoutes.get('/add-product', (request: Request, response: Response) => {
    response.sendFile(path.join(rootDirectory(), 'views', 'add-product.html'))
})

adminRoutes.post('/product', (request: Request, response: Response) => {
    console.log(request.body)
    products.push({ title: request.body.title })
    response.redirect('/')
})
