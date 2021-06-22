import path from 'path'
import { rootDirectory } from '../util/path'

// functions in fs.promises return promises
import { promises as fs } from 'fs'

// UUID generator: https://github.com/uuidjs/uuid
// type definitions can be installed using: npm install --save @types/uuid
import { v5 as uuid } from 'uuid'

export const products: Array<Product> = []

const filePath = path.join(rootDirectory(), 'data', 'products.json')

async function getProductsFromFile(): Promise<Array<Product>> {
    try {
        const fileContents = await fs.readFile(filePath)
        return JSON.parse(fileContents.toString())
    } catch {
        return new Array<Product>()
    }
}

export class Product {
    id: string
    title: string
    imageUrl: string
    description: string
    price: number

    constructor(title: string, imageUrl: string, description: string, price: number) {
        this.id = uuid('http://example.com/hello', uuid.URL)
        this.title = title
        this.imageUrl = imageUrl
        this.description = description
        this.price = price
    }

    /**
     * Appends this product to the current products in the file.
     */
    async save(): Promise<void> {
        const currentProducts = await getProductsFromFile()
        currentProducts.push(this)
        try {
            fs.writeFile(filePath, JSON.stringify(currentProducts))
        } catch (err) {
            console.log(err)
        }
    }

    static async fetchAll(): Promise<Array<Product>> {
        return await getProductsFromFile()
    }

    static async findProduct(id: string): Promise<Product> {
        const allProducts = await getProductsFromFile()
        const requestedProduct = allProducts.find((product) => product.id === id)
        if (requestedProduct) {
            return requestedProduct
        } else {
            // This implicitly returns a rejected promise.
            throw new Error('Cannot find the product with the requested ID.')
        }
    }
}
