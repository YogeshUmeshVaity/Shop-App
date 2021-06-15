import { Request, Response } from 'express'
import { Product } from '../models/product'

export const getProducts = async (request: Request, response: Response): Promise<void> => {
    const products = await Product.fetchAll()
    response.render('shop/product-list', {
        productList: products,
        pageTitle: 'Shop',
        routePath: '/',
        hasProducts: products.length > 0,
        hasProductCSS: true,
        isShopMenu: true
    })
}

export const getIndex = async (request: Request, response: Response): Promise<void> => {
    const products = await Product.fetchAll()
    response.render('shop/index', {
        productList: products,
        pageTitle: 'Shop',
        routePath: '/',
        hasProducts: products.length > 0,
        hasProductCSS: true,
        isShopMenu: true
    })
}
