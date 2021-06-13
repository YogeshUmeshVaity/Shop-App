import express from 'express'

// Controllers
import * as productController from '../controllers/product'

export const adminRoutes = express.Router()

adminRoutes.get('/add-product', productController.getAddProduct)

adminRoutes.post('/product', productController.postAddProduct)

