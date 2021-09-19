import { NextFunction, Request, Response } from 'express'
import { ProductModel as Product } from '../models/Product'
import { UserModel as User } from '../models/User'

export const createTestUser = async (
    request: Request,
    response: Response,
    next: NextFunction
): Promise<void> => {
    try {
        // This user along with its cart with items should be manually created directly in the database.
        request.user = await User.findById('6127bd9d204a47128947a07d')
        // console.log('Current user: ', request.user)
        next()
    } catch (error) {
        next(error)
    }
}

export const createTestUser1 = async (): Promise<void> => {
    const user = await User.findOne()
    if (!user) {
        const user = new User({
            name: 'John',
            email: 'john@test.com',
            cart: {
                items: [],
                totalPrice: 0
            }
        })
        await user.save()
    }
}

export const getAddProduct = (request: Request, response: Response): void => {
    return response.render('admin/edit-product', {
        pageTitle: 'Add Product',
        routePath: '/admin/add-product',
        isEditingMode: false,
        isAuthenticated: request.session.isLoggedIn
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
            createdByUserId: request.session.user._id
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
            productToEdit: productToEdit,
            isAuthenticated: request.session.isLoggedIn
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
            routePath: '/admin/products',
            isAuthenticated: request.session.isLoggedIn
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
    try {
        const productId = request.params.productId
        await Product.findByIdAndRemove(productId)
        const user = await User.findById(request.session.user._id).orFail().exec()
        //TODO: When a product is deleted, it needs to be deleted from the carts of all users, not just this user.
        await user.deleteCartItem(productId)
        response.redirect('/admin/products')
    } catch (error) {
        next(error)
    }
}
