import express, { Request, Response } from 'express'
import path from 'path'
import { rootDirectory } from '../util/path'

export const shopRoutes = express.Router()

// path.join() takes care of separators in a platform independent manner.
// __dirname points to the location of this file. So, we go one directory up by specifying double dot.
shopRoutes.get('/', (request: Request, response: Response) => {
    response.sendFile(path.join(rootDirectory(), 'views', 'shop.html'))
})
