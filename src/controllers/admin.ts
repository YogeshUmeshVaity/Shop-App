import { NextFunction, Request, Response } from 'express'
import { Product } from '../models/product'

// UUID generator: https://github.com/uuidjs/uuid
// type definitions can be installed using: npm install --save @types/uuid
// To get random values every time, don't specify any options while calling uuid() function.
import { v4 as uuid } from 'uuid'

export const getAddProduct = (request: Request, response: Response): void => {
    return response.render('admin/edit-product', {
        pageTitle: 'Add Product',
        routePath: '/admin/add-product',
        isEditingMode: false
    })
}

export const postAddProduct = async (
    request: Request,
    response: Response,
    next: NextFunction
): Promise<void> => {
    try {
        console.log('Request body:', request.body)
        await Product.create({ id: uuid(), ...request.body })
        response.redirect('/')
    } catch (error) {
        next(error)
    }
}

export const getEditProduct = async (
    request: Request,
    response: Response,
    next: NextFunction
): Promise<void> => {
    const productId = request.params.productId
    try {
        const productToEdit = await Product.findByPk(productId)
        if (!productToEdit) {
            response.redirect('/')
        }
        response.render('admin/edit-product', {
            pageTitle: 'Edit Product',
            routePath: '/admin/edit-product',
            isEditingMode: true,
            productToEdit: productToEdit
        })
    } catch (error) {
        next(error)
    }
}

export const postEditProduct = async (
    request: Request,
    response: Response,
    next: NextFunction
): Promise<void> => {
    try {
        await Product.update(
            {
                title: request.body.title,
                imageUrl: request.body.imageUrl,
                description: request.body.description,
                price: request.body.price
            },
            { where: { id: request.body.productId } }
        )
        return response.redirect('/admin/products')
    } catch (error) {
        next(error)
    }
}

export const getProducts = async (
    request: Request,
    response: Response,
    next: NextFunction
): Promise<void> => {
    try {
        response.render('admin/product-list', {
            productList: await Product.findAll(),
            pageTitle: 'Admin Products',
            routePath: '/admin/products'
        })
    } catch (error) {
        next(error)
    }
}

export const postDeleteProduct = async (request: Request, response: Response): Promise<void> => {
    // const deletedProductId = request.params.productId
    // await Product.delete(deletedProductId)
    // return response.redirect('/admin/products')
}
