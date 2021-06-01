import express, { NextFunction, Request, Response } from 'express'
import bodyParser from 'body-parser'
import { adminRoutes } from './routes/admin'
import { shopRoutes } from './routes/shop'
import { HttpException } from './exceptions/HttpException'

const app = express()

app.use(bodyParser.urlencoded({ extended: false }))

app.use('/admin', adminRoutes)
app.use('/', shopRoutes)

app.use((request: Request, response: Response) => {
  response.status(404).send(`<h1>Page not found!</h1>`)
})

app.use((err: HttpException, req: Request, res: Response, next: NextFunction) => {
  err.status = 404
  err.message = 'Not Found'
  next(err)
})

app.listen(3000)
