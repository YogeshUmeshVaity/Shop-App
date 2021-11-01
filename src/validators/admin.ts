import { NextFunction, Request, request, Response } from 'express'
import { body, validationResult } from 'express-validator'

const MIN_CHARS = 8
const MAX_CHARS = 400

const handleErrorsForPostAddProduct = (
    request: Request,
    response: Response,
    next: NextFunction
): void => {
    const errors = validationResult(request)
    if (!errors.isEmpty()) {
        return response.status(422).render('admin/edit-product', {
            pageTitle: 'Add Product',
            routePath: '/admin/add-product',
            isEditingMode: false,
            hasError: true,
            errorMessage: errors.array()[0].msg,
            validationErrors: errors.array(),
            productToEdit: {
                title: request.body.title,
                price: request.body.price,
                description: request.body.description,
                imageUrl: request.body.imageUrl
            }
        })
    }
    next()
}

const handleErrorsForPostEditProduct = (
    request: Request,
    response: Response,
    next: NextFunction
): void => {
    const errors = validationResult(request)
    if (!errors.isEmpty()) {
        return response.status(422).render('admin/edit-product', {
            pageTitle: 'Edit Product',
            routePath: '/admin/add-product',
            isEditingMode: true,
            hasError: true,
            errorMessage: errors.array()[0].msg,
            validationErrors: errors.array(),
            productToEdit: {
                _id: request.body.productId, // Makes sure _id is not lost when errors occur.
                title: request.body.title,
                price: request.body.price,
                description: request.body.description,
                imageUrl: request.body.imageUrl
            }
        })
    }
    next()
}

export const validatePostAddProduct = [
    body('title', 'Title needs to be a text and minimum 3 characters long.')
        .isString()
        .isLength({ min: 3 })
        .trim(),
    body('price', 'Price needs to be a number.').isFloat(),
    body(
        'description',
        `Description needs to be minimum ${MIN_CHARS} and maximum ${MAX_CHARS} characters long`
    )
        .isLength({ min: MIN_CHARS, max: MAX_CHARS })
        .trim(),
    handleErrorsForPostAddProduct
]

export const validatePostEditProduct = [
    body('title', 'Title needs to be a text and minimum 3 characters long.')
        .isString()
        .isLength({ min: 3 })
        .trim(),
    body('imageUrl', 'Please enter a valid URL.').isURL(),
    body('price', 'Price needs to be a number.').isFloat(),
    body(
        'description',
        `Description needs to be minimum ${MIN_CHARS} and maximum ${MAX_CHARS} characters long`
    )
        .isLength({ min: MIN_CHARS, max: MAX_CHARS })
        .trim(),
    handleErrorsForPostEditProduct
]