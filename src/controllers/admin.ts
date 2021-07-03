import { NextFunction, Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'
const db = new PrismaClient()

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
        await db.product.create({
            data: {
                ...request.body,
                price: parseFloat(request.body.price),
                createdByUserId: request.user?.id
            }
        })
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
        const productToEdit = await findProductForUser(productId, request)
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
        const result = await db.product.update({
            where: { id: request.body.productId },
            data: {
                title: request.body.title,
                imageUrl: request.body.imageUrl,
                description: request.body.description,
                price: parseFloat(request.body.price)
            }
        })
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
            productList: await db.product.findMany(),
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
        await db.product.delete({ where: { id: request.params.productId } })
        response.redirect('/admin/products')
    } catch (error) {
        next(error)
    }
}

/**
 * Finds the product only if it matches the currently logged in user.
 */
async function findProductForUser(productId: string, request: Request) {
    return await db.product.findFirst({
        where: {
            AND: [
                {
                    id: {
                        equals: productId
                    }
                },
                {
                    createdByUserId: {
                        equals: request.user?.id
                    }
                }
            ]
        }
    })
}
