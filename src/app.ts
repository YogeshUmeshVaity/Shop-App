import express, { Request, Response } from 'express'
import bodyParser from 'body-parser'
import { adminRoutes } from './routes/admin'

const app = express()

app.use(bodyParser.urlencoded({ extended: false }))

app.use('/admin', adminRoutes)

app.get('/', function (request: Request, response: Response) {
  response.send(`<h1>Hello from Express!</h1>`)
})

app.listen(3000)
