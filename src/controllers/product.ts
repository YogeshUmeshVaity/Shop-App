import { Request, Response } from 'express'
import { Product } from '../models/product'

export const getAddProduct = (request: Request, response: Response): void => {
    return response.render('add-product', {
        pageTitle: 'Add Product',
        routePath: '/admin/add-product',
        hasProductCSS: true,
        hasFormsCSS: true,
        isAddProductMenu: true
    })
}

export const products: Array<Product> = []

export const postAddProduct = (request: Request, response: Response): void => {
    console.log(request.body)
    products.push({ title: request.body.title })
    response.redirect('/')
}

export const getProducts = (request: Request, response: Response): void => {
    response.render('shop', {
        productList: products,
        pageTitle: 'Shop',
        routePath: '/',
        hasProducts: products.length > 0,
        hasProductCSS: true,
        isShopMenu: true
    })
}
