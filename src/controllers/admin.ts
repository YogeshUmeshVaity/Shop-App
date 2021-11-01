import { NextFunction, Request, Response } from 'express'
import { ProductModel as Product } from '../models/Product'
import { UserModel as User } from '../models/User'
import { DatabaseException } from '../exceptions/HttpExceptions/DatabaseException'

export const initializeUser = async (
    request: Request,
    response: Response,
    next: NextFunction
): Promise<void> => {
    try {
        if (!request.session.user) {
            return next()
        }
        request.user = await User.findById(request.session.user._id).orFail().exec()
        next()
    } catch (error) {
        next(new DatabaseException(`Error initializing the user.`))
    }
}

export const addLocals = (request: Request, response: Response, next: NextFunction): void => {
    response.locals.isAuthenticated = request.session.isLoggedIn
    response.locals.csrfToken = request.csrfToken()
    next()
}

export const getAddProduct = (request: Request, response: Response): void => {
    return response.render('admin/edit-product', {
        pageTitle: 'Add Product',
        routePath: '/admin/add-product',
        isEditingMode: false,
        hasError: false,
        errorMessage: null,
        validationErrors: []
    })
}

export const postAddProduct = async (
    request: Request,
    response: Response,
    next: NextFunction
): Promise<void> => {
    const image = request.file
    console.log('uploaded file: ', image)
    try {
        const newProduct = new Product({
            title: request.body.title,
            price: request.body.price,
            description: request.body.description,
            createdByUserId: request.session.user._id
        })
        await newProduct.save()
        response.redirect('/')
    } catch (error) {
        next(new DatabaseException('Problem saving the new product to the database.'))
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
            hasError: false,
            errorMessage: null,
            validationErrors: []
        })
    } catch (error) {
        next(
            new DatabaseException(
                `Editing of product failed. The product with ID ${productId} cannot not be found.`
            )
        )
    }
}

/**
 * We use the findOneAndUpdate() instead of first finding the document and then updating it, because
 * with the exception of an unindexed upsert, findOneAndUpdate() is atomic. That means you can
 * assume the document doesn't change between when MongoDB finds the document and when it updates
 * the document, unless you're doing an upsert.
 *
 * Adding the extra condition of createdByUserId ensures that only the user who created this product
 * (currently logged in user) can edit it.
 */
export const postEditProduct = async (
    request: Request,
    response: Response,
    next: NextFunction
): Promise<void> => {
    const productId = request.body.productId
    const userId = request.user._id
    try {
        await Product.findOneAndUpdate(
            { _id: productId, createdByUserId: userId },
            {
                title: request.body.title,
                imageUrl: request.body.imageUrl,
                description: request.body.description,
                price: request.body.price
            }
        )
        return response.redirect('/admin/products')
    } catch (error) {
        next(
            new DatabaseException(
                `Editing of product failed. The product with ID ${productId} created by 
                 userId ${userId} cannot not be found.`
            )
        )
    }
}

export const getProducts = async (
    request: Request,
    response: Response,
    next: NextFunction
): Promise<void> => {
    const userId = request.user._id
    try {
        response.render('admin/product-list', {
            // Shows only the products created by the currently logged in user.
            productList: await Product.find({ createdByUserId: userId }),
            pageTitle: 'Admin Products',
            routePath: '/admin/products'
        })
    } catch (error) {
        next(new DatabaseException(`Unable to retrieve the products created by user ID ${userId}`))
    }
}

export const postDeleteProduct = async (
    request: Request,
    response: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const productId = request.params.productId
        await Product.deleteOne({ _id: productId, createdByUserId: request.user._id })
        const user = await User.findById(request.session.user._id).orFail().exec()
        //TODO: When a product is deleted, it needs to be deleted from the carts of all users, not just this user.
        await user.deleteCartItem(productId)
        response.redirect('/admin/products')
    } catch (error) {
        next(new DatabaseException(`Unable to the delete the product.`))
    }
}
