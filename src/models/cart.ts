import path from 'path'
import { rootDirectory } from '../util/path'
import { promises as fs } from 'fs'

interface CartItem {
    id: string
    quantity: number
}

export class Cart {
    items: Array<CartItem> = []
    totalPrice = 0
}

export async function addItem(newItemId: string, price: number): Promise<void> {
    const cart = await getCartFromFile()
    const existingItem = findExistingItemIn(cart.items, newItemId)
    increaseExistingQuantityOrAddNewItem(existingItem, cart, newItemId)
    increaseTotalPrice(cart, price)
    saveCartToFile(cart)
}

export async function removeItem(itemId: string, price: number): Promise<void> {
    const cart = await getCartFromFile()
    const removedItem = findExistingItemIn(cart.items, itemId)
    if (removedItem) {
        removeItemFrom(cart, removedItem)
        decreaseTotalPrice(cart, price, removedItem)
        saveCartToFile(cart)
    }
}

function removeItemFrom(cart: Cart, removedItem: CartItem) {
    cart.items = cart.items.filter((item) => item.id !== removedItem.id)
}

function decreaseTotalPrice(cart: Cart, price: number, removedItem: CartItem) {
    cart.totalPrice = cart.totalPrice - price * removedItem.quantity
}

const cartFilePath = path.join(rootDirectory(), 'data', 'cart.json')

async function getCartFromFile(): Promise<Cart> {
    try {
        const fileContents = await fs.readFile(cartFilePath)
        return JSON.parse(fileContents.toString())
    } catch {
        return new Cart()
    }
}

async function saveCartToFile(cart: Cart): Promise<void> {
    await fs.writeFile(cartFilePath, JSON.stringify(cart))
}

function increaseTotalPrice(cart: Cart, price: number) {
    // converted price to number by an additional plus.
    cart.totalPrice = cart.totalPrice + +price
}

function increaseExistingQuantityOrAddNewItem(
    existingItem: CartItem | undefined,
    cart: Cart,
    newItemId: string
) {
    if (existingItem) {
        existingItem.quantity++
    } else {
        cart.items.push({ id: newItemId, quantity: 1 })
    }
}

function findExistingItemIn(
    currentCartItems: Array<CartItem>,
    newProductId: string
): CartItem | undefined {
    return currentCartItems.find((cartItem) => cartItem.id === newProductId)
}
