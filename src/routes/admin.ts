import express from 'express'
import { body } from 'express-validator'

// Controllers
import * as adminController from '../controllers/admin'
import { authenticate } from '../middleware/authenticate'

export const adminRoutes = express.Router()
const MIN_CHARS = 8
const MAX_CHARS = 400

adminRoutes.get('/products', authenticate, adminController.getProducts)

adminRoutes.get('/add-product', authenticate, adminController.getAddProduct)

adminRoutes.post(
    '/add-product',
    [
        body('title', 'Title needs to be a text and minimum 3 characters long.')
            .isString()
            .isLength({ min: 3 })
            .trim(),
        body('imageUrl', 'Please enter a valid URL.').isURL(),
        body('price', 'Price needs to be a number.').isFloat(),
        body(
            'description',
            `Description needs to be minimum ${MIN_CHARS} and maximum ${MAX_CHARS}  characters long`
        )
            .isLength({ min: MIN_CHARS, max: MAX_CHARS })
            .trim()
    ],
    authenticate,
    adminController.postAddProduct
)

adminRoutes.get('/edit-product/:productId', authenticate, adminController.getEditProduct)

adminRoutes.post(
    '/edit-product',
    [
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
            .trim()
    ],
    authenticate,
    adminController.postEditProduct
)

adminRoutes.post('/delete-product/:productId', authenticate, adminController.postDeleteProduct)
