import path from 'path'
import { rootDirectory } from '../util/path'

// functions in fs.promises return promises
import { promises as fs } from 'fs'

// UUID generator: https://github.com/uuidjs/uuid
// type definitions can be installed using: npm install --save @types/uuid
// To get random values every time, don't specify any options while calling uuid() function.
import { v4 as uuid } from 'uuid'

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

    constructor(id: string, title: string, imageUrl: string, description: string, price: number) {
        this.id = id
        this.title = title
        this.imageUrl = imageUrl
        this.description = description
        this.price = price
    }

    /**
     * Appends this product to the current products in the file.
     */
    static async save(
        title: string,
        imageUrl: string,
        description: string,
        price: number
    ): Promise<void> {
        const currentProducts = await getProductsFromFile()
        const newProduct = new Product(uuid(), title, imageUrl, description, price)
        currentProducts.push(newProduct)
        try {
            fs.writeFile(filePath, JSON.stringify(currentProducts))
        } catch (err) {
            console.log(err)
        }
    }

    static async update(
        id: string,
        title: string,
        imageUrl: string,
        description: string,
        price: number
    ): Promise<void> {
        const allProducts = await this.fetchAll()
        const updatedProductIndex = allProducts.findIndex((product) => product.id === id)
        console.log(updatedProductIndex)
        allProducts[updatedProductIndex].title = title
        allProducts[updatedProductIndex].imageUrl = imageUrl
        allProducts[updatedProductIndex].description = description
        allProducts[updatedProductIndex].price = price
        await fs.writeFile(filePath, JSON.stringify(allProducts))
    }

    static async delete(productId: string): Promise<void> {
        const allProducts = await Product.fetchAll()
        // By filtering, exclude the product to be deleted.
        const filteredProducts = allProducts.filter((product) => {
            console.log(`actual ID: ${product.id}`)
            console.log(`deleted ID: ${productId}`)
            return product.id !== productId
        })
        await fs.writeFile(filePath, JSON.stringify(filteredProducts))
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
