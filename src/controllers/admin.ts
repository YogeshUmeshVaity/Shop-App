import { NextFunction, Request, Response } from 'express'
import Product from '../models/Product'

export const createTestUser = async (
    request: Request,
    response: Response,
    next: NextFunction
): Promise<void> => {
    // try {
    //     // This user along with its cart with items should be manually created directly in the database.
    //     request.user = await User.findById('60f02a0419a7eaf596a820ee')
    //     console.log('Current user: ', request.user)
    //     next()
    // } catch (error) {
    //     next(error)
    // }
}

export const getAddProduct = (request: Request, response: Response): void => {
    return response.render('admin/edit-product', {
        pageTitle: 'Add Product',
        routePath: '/admin/add-product',
        isEditingMode: false,
    })
}

export const postAddProduct = async (
    request: Request,
    response: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const newProduct = new Product({
            title: request.body.title,
            price: request.body.price,
            description: request.body.description,
            imageUrl: request.body.imageUrl,
            //request.user._id
        })
        await newProduct.save()
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
        const productToEdit = await Product.findById(productId).orFail()
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
        const result = await Product.findByIdAndUpdate(request.body.productId, {
            title: request.body.title,
            imageUrl: request.body.imageUrl,
            description: request.body.description,
            price: request.body.price
        })
        // TODO: handleResult(result)
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
            productList: await Product.find(),
            pageTitle: 'Admin Products',
            routePath: '/admin/products'
        })
    } catch (error) {
        next(error)
    }
}

export const postDeleteProduct = async (
    request: Request,
    response: Response,
    next: NextFunction
): Promise<void> => {
    // try {
    //     await Product.deleteById(request.params.productId)
    //     response.redirect('/admin/products')
    // } catch (error) {
    //     next(error)
    // }
}
