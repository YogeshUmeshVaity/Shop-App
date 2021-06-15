import { Request, Response } from 'express'
import { Product } from '../models/product'

export const getProducts = async (request: Request, response: Response): Promise<void> => {
    const products = await Product.fetchAll()
    response.render('shop/product-list', {
        productList: products,
        pageTitle: 'All Products',
        routePath: '/products'
    })
}

export const getIndex = async (request: Request, response: Response): Promise<void> => {
    const products = await Product.fetchAll()
    response.render('shop/index', {
        productList: products,
        pageTitle: 'Shop',
        routePath: '/'
    })
}

export const getCart = (request: Request, response: Response): void => {
    response.render('shop/cart', {
        pageTitle: 'Your Cart',
        routePath: '/cart'
    })
}