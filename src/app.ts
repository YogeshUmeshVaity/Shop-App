import express from 'express'
import { adminRoutes } from './routes/admin'
import { shopRoutes } from './routes/shop'
import path from 'path'

// Controllers
import * as errorController from './controllers/error'

const app = express()

// Set the rendering engine to be used.
app.set('view engine', 'ejs')

// Set the name of the directory where views are stored.
app.set('views', path.join(__dirname, 'views'))

app.use(express.urlencoded({ extended: false }))

// Used for serving public static files.
app.use(express.static(path.join(__dirname, 'public')))

app.use('/admin', adminRoutes)
app.use('/', shopRoutes)

app.use(errorController.get404)

app.listen(3000)
