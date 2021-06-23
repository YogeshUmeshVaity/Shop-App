import { Request, Response } from 'express'
import { Product } from '../models/product'

export const getAddProduct = (request: Request, response: Response): void => {
    return response.render('admin/edit-product', {
        pageTitle: 'Add Product',
        routePath: '/admin/add-product',
        isEditingMode: false
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

export const getEditProduct = async (request: Request, response: Response): Promise<void> => {
    const productId = request.params.productId
    try {
        const productToEdit = await Product.findProduct(productId)
        return response.render('admin/edit-product', {
            pageTitle: 'Edit Product',
            routePath: '/admin/edit-product',
            isEditingMode: true,
            productToEdit: productToEdit
        })
    } catch {
        // Product not found
        return response.render('/404')
    }
}

export const getAdminProducts = async (request: Request, response: Response): Promise<void> => {
    const products = await Product.fetchAll()
    response.render('admin/product-list', {
        productList: products,
        pageTitle: 'Admin Products',
        routePath: '/admin/products'
    })
}
