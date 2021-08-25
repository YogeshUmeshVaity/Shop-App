import express from 'express'
import * as shopController from '../controllers/shop'

export const shopRoutes = express.Router()

shopRoutes.get('/', shopController.getIndex)

shopRoutes.get('/products', shopController.getProducts)

shopRoutes.get('/products/:productId', shopController.getProductDetails)

shopRoutes.get('/cart', shopController.getCart)

shopRoutes.post('/cart', shopController.postCart)

shopRoutes.post('/delete-cart-item', shopController.deleteCartItem)

shopRoutes.post('/create-order', shopController.postOrder)

shopRoutes.get('/orders', shopController.getOrders)
