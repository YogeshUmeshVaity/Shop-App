import path from 'path'
import { rootDirectory } from '../util/path'
import { promises as fs } from 'fs' // functions in fs.promises return promises

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
    title: string
    imageUrl: string
    description: string
    price: number

    constructor(title: string, imageUrl: string, description: string, price: number) {
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
}
