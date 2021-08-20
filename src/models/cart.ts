// import path from 'path'
// import { rootDirectory } from '../util/path'
// import { promises as fs } from 'fs'
import { Product } from './Product'

// TODO: Use the inc operator of mongodb to increase the quantity.
export interface CartItem {
    productId: string
    quantity: number
}

// TODO: Use the push operator of mongodb array to push a CartItem.
export class Cart {
    items: Array<CartItem> = []
    totalPrice = 0
}

export interface CartItemWithProduct {
    product: Product
    quantity: number
}
export class CartWithProducts {
    items: Array<CartItemWithProduct> = []
    totalPrice = 0
}

// export async function addItem(newProduct: Product, price: number): Promise<void> {
//     const cart = await getCartFromFile()
//     const existingItem = findExistingItem(cart.items, newProduct)
//     increaseExistingQuantityOrAddNewItem(existingItem, cart, newProduct)
//     increaseTotalPrice(cart, price)
//     saveCartToFile(cart)
// }

// export async function removeItem(itemId: string, price: number): Promise<void> {
//     const cart = await getCartFromFile()
//     const removedItem = findExistingItemById(cart.items, itemId)
//     if (removedItem) {
//         removeItemFrom(cart, removedItem)
//         decreaseTotalPrice(cart, price, removedItem)
//         saveCartToFile(cart)
//     }
// }

// export async function getCart(): Promise<Cart> {
//     return await getCartFromFile()
// }

// function removeItemFrom(cart: Cart, removedItem: CartItem) {
//     cart.items = cart.items.filter((item) => item.product.id !== removedItem.product.id)
// }

// function decreaseTotalPrice(cart: Cart, price: number, removedItem: CartItem) {
//     cart.totalPrice = cart.totalPrice - price * removedItem.quantity
//     // Takes care of remaining fractions after deleting the items.
//     if (cart.items.length === 0) {
//         cart.totalPrice = 0
//     }
// }

// const cartFilePath = path.join(rootDirectory(), 'data', 'cart.json')

// async function getCartFromFile(): Promise<Cart> {
//     try {
//         const fileContents = await fs.readFile(cartFilePath)
//         return JSON.parse(fileContents.toString())
//     } catch {
//         return new Cart()
//     }
// }

// async function saveCartToFile(cart: Cart): Promise<void> {
//     await fs.writeFile(cartFilePath, JSON.stringify(cart))
// }

// function increaseTotalPrice(cart: Cart, price: number) {
//     // converted price to number by an additional plus.
//     cart.totalPrice = cart.totalPrice + +price
// }

// function increaseExistingQuantityOrAddNewItem(
//     existingItem: CartItem | undefined,
//     cart: Cart,
//     newProduct: Product
// ) {
//     if (existingItem) {
//         existingItem.quantity++
//     } else {
//         cart.items.push({ product: newProduct, quantity: 1 })
//     }
// }

// function findExistingItem(
//     currentCartItems: Array<CartItem>,
//     newProduct: Product
// ): CartItem | undefined {
//     return currentCartItems.find((cartItem) => cartItem.product.id === newProduct.id)
// }

// function findExistingItemById(
//     currentCartItems: Array<CartItem>,
//     newProductId: string
// ): CartItem | undefined {
//     return currentCartItems.find((cartItem) => cartItem.product.id === newProductId)
// }
