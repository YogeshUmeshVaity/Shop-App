import express from 'express'

// Controllers
import * as adminController from '../controllers/admin'

export const adminRoutes = express.Router()
adminRoutes.get('/products', adminController.getAdminProducts)

adminRoutes.get('/add-product', adminController.getAddProduct)

adminRoutes.post('/product', adminController.postAddProduct)
