export const products: Array<Product> = []

export class Product {
    title: string

    constructor(title: string) {
        this.title = title
    }

    save(): void {
        products.push(this)
    }

    static fetchAll(): Array<Product> {
        return products
    }
}

