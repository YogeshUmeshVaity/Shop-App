import express, { Request, Response } from 'express'
import bodyParser from 'body-parser'
import { adminRoutes } from './routes/admin'
import { shopRoutes } from './routes/shop'

const app = express()

app.use(bodyParser.urlencoded({ extended: false }))

app.use('/admin', adminRoutes)
app.use('/', shopRoutes)

app.listen(3000)
