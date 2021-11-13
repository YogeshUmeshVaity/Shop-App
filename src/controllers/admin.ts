import { NextFunction, Request, Response } from 'express'
import { Product, ProductModel } from '../models/Product'
import { User, UserModel } from '../models/User'
import { DatabaseException } from '../exceptions/httpExceptions/DatabaseException'
import { DocumentType } from '@typegoose/typegoose'
import { deleteFile } from '../util/fileSystem'
import { FileDeleteException } from '../exceptions/fileExceptions/FileDeleteException'
import path from 'path'
import { ITEMS_PER_PAGE, preparePaginationData } from './shop'
import { Logger } from '../lib/logger'

export const initializeUser = async (
    request: Request,
    response: Response,
    next: NextFunction
): Promise<void> => {
    try {
        if (!request.session.user) {
            return next()
        }
        request.user = await UserModel.findById(request.session.user._id).orFail().exec()
        next()
    } catch (error) {
        next(new DatabaseException(`Error initializing the user.`, error))
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
    Logger.http(`Product title: ${request.body.title}`)
    const productImage = request.file
    // Won't be thrown, taken care in validation already. This is just for non-null assertion.
    if (!productImage) throw Error('The product image file is undefined.')
    try {
        const newProduct = new ProductModel({
            title: request.body.title,
            price: request.body.price,
            description: request.body.description,
            imageUrl: productImage.filename,
            createdByUserId: request.session.user._id
        })
        await newProduct.save()
        response.redirect('/')
    } catch (error) {
        next(new DatabaseException('Problem saving the new product to the database.', error))
    }
}

export const getEditProduct = async (
    request: Request,
    response: Response,
    next: NextFunction
): Promise<void> => {
    const productId = request.params.productId
    try {
        const productToEdit = await ProductModel.findById(productId).orFail()
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
                `Editing of product failed. The product with ID ${productId} cannot not be found.`,
                error
            )
        )
    }
}

export const postEditProduct = async (
    request: Request,
    response: Response,
    next: NextFunction
): Promise<void> => {
    const productId = request.body.productId
    const userId = request.user._id
    const newImage = request.file
    try {
        const productToUpdate = await findProductToUpdate(productId, userId)
        await updateProduct(productToUpdate, request, newImage)
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
    const userId = request.user._id
    const currentPage = getPageNumber(request)
    try {
        const productCount = await getProductCount(userId)
        const productsToDisplay = await getProductsToDisplay(currentPage, userId)
        const paginationData = preparePaginationData(currentPage, productCount)
        response.render('admin/product-list', {
            // Shows only the products created by the currently logged in user.
            productList: productsToDisplay,
            pageTitle: 'Admin Products',
            routePath: '/admin/products',
            paginationData: paginationData
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
        await deleteProductImage(request)
        await deleteProduct(request)
        const user = await findUser(request)
        //TODO: When a product is deleted, it needs to be deleted from the carts of all users, not just this user.
        await user.deleteCartItem(productId)
        response.status(200).json({ message: 'Success!' })
    } catch (error) {
        response.status(500).json({ message: 'Deleting the product failed.' })
    }
}

async function findUser(request: Request): Promise<DocumentType<User>> {
    try {
        return await UserModel.findById(request.session.user._id).orFail().exec()
    } catch (error) {
        throw new DatabaseException('Unable to the find the user.', error)
    }
}

async function deleteProduct(request: Request) {
    try {
        await ProductModel.deleteOne({
            _id: request.params.productId,
            createdByUserId: request.user._id
        })
    } catch (error) {
        throw new DatabaseException(`Unable to the delete the product.`, error)
    }
}

async function updateProduct(
    productToUpdate: DocumentType<Product>,
    request: Request,
    newImage: Express.Multer.File | undefined
) {
    productToUpdate.title = request.body.title
    productToUpdate.description = request.body.description
    productToUpdate.price = request.body.price
    try {
        if (newImage) {
            await deleteOldImage(productToUpdate)
            updateNewUrl(productToUpdate, newImage.filename)
        }
        await productToUpdate.save()
    } catch (error) {
        if (error instanceof FileDeleteException) {
            throw error
        } else {
            throw new DatabaseException(
                `Something went wrong while saving the product to the database.`,
                error
            )
        }
    }
}

async function deleteOldImage(productToUpdate: DocumentType<Product>) {
    const oldUrl = path.join(__dirname, '..', 'images', productToUpdate.imageUrl)
    await deleteFile(oldUrl)
}

/**
 * Adding the extra condition of createdByUserId ensures that only the user who created this product
 * (currently logged in user) can edit it.
 */
async function findProductToUpdate(productId: string, userId: string) {
    try {
        return await ProductModel.findOne({
            _id: productId,
            createdByUserId: userId
        })
            .orFail()
            .exec()
    } catch (error) {
        throw new DatabaseException(
            `Editing of product failed. The product with ID ${productId} created by 
                 userId ${userId} cannot not be found.`,
            error
        )
    }
}

function updateNewUrl(productToUpdate: DocumentType<Product>, newUrl: string) {
    productToUpdate.imageUrl = newUrl
}

async function deleteProductImage(request: Request) {
    let productToDelete
    try {
        productToDelete = await ProductModel.findById(request.params.productId).orFail().exec()
    } catch (error) {
        throw new DatabaseException(
            `Couldn't delete the product image because the product was not found.`,
            error
        )
    }
    deleteOldImage(productToDelete)
}

function getPageNumber(request: Request): number {
    // Cast it to a Number for calculation purpose.
    // If there is no page number in the route, then the default is 1.
    return Number(request.query.page) || 1
}

async function getProductCount(userId: string): Promise<number> {
    try {
        return await ProductModel.find({ createdByUserId: userId }).countDocuments().exec()
    } catch (error) {
        throw new DatabaseException(
            `Unable to retrieve the product count for user ID ${userId}`,
            error
        )
    }
}

async function getProductsToDisplay(
    page: number,
    userId: string
): Promise<DocumentType<Product>[]> {
    try {
        return await ProductModel.find({ createdByUserId: userId })
            .skip((page - 1) * ITEMS_PER_PAGE)
            .limit(ITEMS_PER_PAGE)
            .exec()
    } catch (error) {
        throw new DatabaseException(
            `Unable to retrieve the products created by user ID ${userId}`,
            error
        )
    }
}
