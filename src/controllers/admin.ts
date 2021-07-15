import { NextFunction, Request, Response } from 'express'
import { Product } from '../models/Product'
import { User } from '../models/User'

export const createTestUser = async (
    request: Request,
    response: Response,
    next: NextFunction
): Promise<void> => {
    try {
        // This user should be manually created directly in the database.
        request.user = await User.findById('60f02a0419a7eaf596a820ee')
        console.log('Current user: ', request.user)
        next()
    } catch (error) {
        next(error)
    }
}

export const getAddProduct = (request: Request, response: Response): void => {
    return response.render('admin/edit-product', {
        pageTitle: 'Add Product',
        routePath: '/admin/add-product',
        isEditingMode: false
    })
}

export const postAddProduct = async (
    request: Request,
    response: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const newProduct = new Product(
            request.body.title,
            request.body.price,
            request.body.description,
            request.body.imageUrl
        )
        await newProduct.save()
        response.redirect('/')
    } catch (error) {
        next(error)
    }
}

export const getEditProduct = async (
    request: Request,
    response: Response,
    next: NextFunction
): Promise<void> => {
    const productId = request.params.productId
    try {
        const productToEdit = await Product.findById(productId)
        if (!productToEdit) {
            response.redirect('/')
        }
        response.render('admin/edit-product', {
            pageTitle: 'Edit Product',
            routePath: '/admin/edit-product',
            isEditingMode: true,
            productToEdit: productToEdit
        })
    } catch (error) {
        next(error)
    }
}

export const postEditProduct = async (
    request: Request,
    response: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const result = await Product.update(
            request.body.productId,
            request.body.title,
            request.body.imageUrl,
            request.body.description,
            request.body.price
        )
        // TODO: handleResult(result)
        return response.redirect('/admin/products')
    } catch (error) {
        next(error)
    }
}

export const getProducts = async (
    request: Request,
    response: Response,
    next: NextFunction
): Promise<void> => {
    try {
        response.render('admin/product-list', {
            productList: await Product.findAll(),
            pageTitle: 'Admin Products',
            routePath: '/admin/products'
        })
    } catch (error) {
        next(error)
    }
}

export const postDeleteProduct = async (
    request: Request,
    response: Response,
    next: NextFunction
): Promise<void> => {
    try {
        await Product.deleteById(request.params.productId)
        response.redirect('/admin/products')
    } catch (error) {
        next(error)
    }
}

// /**
//  * Finds all the products created by the currently logged in user.
//  */
// async function productsOfUser(request: Request) {
//     return await db.product.findMany({
//         where: { createdByUserId: request.user?.id }
//     })
// }

/**
 * Finds the product only if it matches the currently logged in user.
 */
// async function findProductForUser(productId: string, request: Request) {
//     return await db.product.findFirst({
//         where: {
//             AND: [
//                 {
//                     id: {
//                         equals: productId
//                     }
//                 },
//                 {
//                     createdByUserId: {
//                         equals: request.user?.id
//                     }
//                 }
//             ]
//         }
//     })
// }

// async function createIfDoesntExist(user: User | null) {
//     if (user == null) {
//         console.log('User test', user)
//         user = await createUser()
//         await createCartFor(user)
//     }
//     return user
// }

// // TODO: make sure the cart is pre-created for the user, otherwise an undefined is passed to the
// // cart.ejs view. Do this whenever new a user signs up.
// async function createCartFor(user: User) {
//     await db.cart.create({
//         data: {
//             userId: user.id
//         }
//     })
// }

// async function createUser(): Promise<User> {
//     return await db.user.create({
//         data: {
//             id: '1',
//             name: 'John',
//             email: 'john@test.com'
//         }
//     })
// }
