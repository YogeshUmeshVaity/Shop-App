import express, { NextFunction, Request, Response } from 'express'
import { adminRoutes } from './routes/admin'
import { shopRoutes } from './routes/shop'
import { HttpException } from './exceptions/HttpException'
import path from 'path'
import { rootDirectory } from './util/path'

const app = express()

// Set the rendering engine to be used.
app.set('view engine', 'pug')

// Set the name of the directory where views are stored.
app.set('views', path.join(__dirname, 'views'))

app.use(express.urlencoded({ extended: false }))

// Used for serving public static files.
app.use(express.static(path.join(__dirname, 'public')))

app.use('/admin', adminRoutes)
app.use('/', shopRoutes)

app.use((request: Request, response: Response) => {
    response.status(404).sendFile(path.join(rootDirectory(), 'views', '404.html'))
})

app.use((err: HttpException, req: Request, res: Response, next: NextFunction) => {
    err.status = 404
    next(err)
})

app.listen(3000)
