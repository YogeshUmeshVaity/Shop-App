import express from 'express'
import * as shopController from '../controllers/shop'
import { authenticate } from '../middleware/authenticate'

export const shopRoutes = express.Router()

shopRoutes.get('/', shopController.getIndex)

shopRoutes.get('/products', shopController.getProducts)

shopRoutes.get('/products/:productId', shopController.getProductDetails)

shopRoutes.get('/cart', authenticate, shopController.getCart)

shopRoutes.post('/cart', authenticate, shopController.postCart)

shopRoutes.post('/delete-cart-item', authenticate, shopController.deleteCartItem)

shopRoutes.get('/checkout', authenticate, shopController.getCheckout)

shopRoutes.get('/checkout/success', authenticate, shopController.getCheckoutSuccess)

shopRoutes.get('/checkout/cancel', authenticate, shopController.getCheckout)

// shopRoutes.post('/create-order', authenticate, shopController.postOrder)

shopRoutes.get('/orders', authenticate, shopController.getOrders)

shopRoutes.get('/orders/:orderId', authenticate, shopController.getInvoice)
