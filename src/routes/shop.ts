import express from 'express'
import * as productController from '../controllers/product'

export const shopRoutes = express.Router()

shopRoutes.get('/', productController.getProducts)
