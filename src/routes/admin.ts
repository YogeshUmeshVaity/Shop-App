import express from 'express'
import { body } from 'express-validator'

// Controllers
import * as adminController from '../controllers/admin'
import { authenticate } from '../middleware/authenticate'

export const adminRoutes = express.Router()

adminRoutes.get('/products', authenticate, adminController.getProducts)

adminRoutes.get('/add-product', authenticate, adminController.getAddProduct)

adminRoutes.post(
    '/add-product',
    [
        body('title').isAlphanumeric().isLength({ min: 3 }).trim(),
        body('imageUrl').isURL(),
        body('price').isFloat(),
        body('description').isLength({ min: 8, max: 400 }).trim()
    ],
    authenticate,
    adminController.postAddProduct
)

adminRoutes.get('/edit-product/:productId', authenticate, adminController.getEditProduct)

adminRoutes.post(
    '/edit-product',
    [
        body('title').isAlphanumeric().isLength({ min: 3 }).trim(),
        body('imageUrl').isURL(),
        body('price').isFloat(),
        body('description').isLength({ min: 8, max: 400 }).trim()
    ],
    authenticate,
    adminController.postEditProduct
)

adminRoutes.post('/delete-product/:productId', authenticate, adminController.postDeleteProduct)
