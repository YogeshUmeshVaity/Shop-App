import express from 'express'

// Controllers
import * as adminController from '../controllers/admin'
import { authenticate } from '../middleware/authenticate'
import * as validate from '../validators/admin'

export const adminRoutes = express.Router()

adminRoutes.get('/products', authenticate, adminController.getProducts)

adminRoutes.get('/add-product', authenticate, adminController.getAddProduct)

adminRoutes.post(
    '/add-product',
    validate.addOREditProduct,
    authenticate,
    adminController.postAddProduct
)

adminRoutes.get('/edit-product/:productId', authenticate, adminController.getEditProduct)

adminRoutes.post(
    '/edit-product',
    validate.addOREditProduct,
    authenticate,
    adminController.postEditProduct
)

adminRoutes.post('/delete-product/:productId', authenticate, adminController.postDeleteProduct)
