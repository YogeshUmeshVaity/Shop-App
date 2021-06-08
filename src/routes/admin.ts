import express, { Request, Response } from 'express'
import { Product } from '../models/product'

export const adminRoutes = express.Router()
export const products: Array<Product> = []

adminRoutes.get('/add-product', (request: Request, response: Response) => {
    response.render('add-product', { pageTitle: 'Add Product', routePath: '/admin/add-product' })
})

adminRoutes.post('/product', (request: Request, response: Response) => {
    console.log(request.body)
    products.push({ title: request.body.title })
    response.redirect('/')
})
