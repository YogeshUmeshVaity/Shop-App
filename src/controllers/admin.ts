import { Request, Response } from 'express'
import { Product } from '../models/product'

export const getAddProduct = (request: Request, response: Response): void => {
    return response.render('admin/add-product', {
        pageTitle: 'Add Product',
        routePath: '/admin/add-product'
    })
}

export const postAddProduct = (request: Request, response: Response): void => {
    console.log(request.body)
    const product = new Product(
        request.body.title,
        request.body.imageUrl,
        request.body.description,
        request.body.price
    )
    product.save()
    response.redirect('/')
}

export const getAdminProducts = async (request: Request, response: Response): Promise<void> => {
    const products = await Product.fetchAll()
    response.render('admin/product-list', {
        productList: products,
        pageTitle: 'Admin Products',
        routePath: '/admin/products'
    })
}
