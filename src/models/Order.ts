import { Product } from './Product'

export interface OrderItem {
    product: Product
    quantity: number
}

export class Order {
    items: Array<OrderItem> = []
    totalPrice = 0
}
