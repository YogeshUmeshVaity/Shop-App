import express from 'express'

// Controllers
import * as adminController from '../controllers/admin'
import { authenticate } from '../middleware/authenticate'

export const adminRoutes = express.Router()

adminRoutes.get('/products', authenticate, adminController.getProducts)

adminRoutes.get('/add-product', authenticate, adminController.getAddProduct)

adminRoutes.post('/add-product', authenticate, adminController.postAddProduct)

adminRoutes.get('/edit-product/:productId', authenticate, adminController.getEditProduct)

adminRoutes.post('/edit-product', authenticate, adminController.postEditProduct)

adminRoutes.post('/delete-product/:productId', authenticate, adminController.postDeleteProduct)
