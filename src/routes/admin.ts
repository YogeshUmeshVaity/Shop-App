import express from 'express'

// Controllers
import * as adminController from '../controllers/admin'

export const adminRoutes = express.Router()

adminRoutes.get('/products', adminController.getAdminProducts)

adminRoutes.get('/add-product', adminController.getAddProduct)

adminRoutes.post('/add-product', adminController.postAddProduct)

adminRoutes.get('/edit-product/:productId', adminController.getEditProduct)

adminRoutes.post('/edit-product', adminController.postEditProduct)
