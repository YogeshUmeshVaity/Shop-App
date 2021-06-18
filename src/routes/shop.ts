import express from 'express'
import * as shopController from '../controllers/shop'

export const shopRoutes = express.Router()

shopRoutes.get('/', shopController.getIndex)

shopRoutes.get('/products', shopController.getProducts)

shopRoutes.get('/products/:productId', shopController.getProductDetails)

shopRoutes.get('/cart', shopController.getCart)

shopRoutes.get('/orders', shopController.getOrders)


shopRoutes.get('/checkout', shopController.getCheckout)
