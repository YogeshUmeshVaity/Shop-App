import express, { Request, Response } from 'express'
import { products } from '../routes/admin'

export const shopRoutes = express.Router()

// path.join() takes care of separators in a platform independent manner.
// __dirname points to the location of this file. So, we go one directory up by specifying double dot.
shopRoutes.get('/', (request: Request, response: Response) => {
    console.log(products)
    response.render('shop')
})
