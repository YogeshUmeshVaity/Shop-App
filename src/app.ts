import express from 'express'
import { adminRoutes } from './routes/admin'
import { shopRoutes } from './routes/shop'
import { authRoutes } from './routes/authentication'
import path from 'path'
import dotenv from 'dotenv'
import { connectOptions, databaseUrl } from './util/database'
import mongoose from 'mongoose'

// Controllers
import * as errorController from './controllers/error'
import { createTestUser as initializeTestUser } from './controllers/admin'
import { createTestUser1 as createTestUser } from './controllers/admin'

const app = express()

// Load environment variables from a .env file
dotenv.config()

// Set the rendering engine to be used.
app.set('view engine', 'ejs')

// Set the name of the directory where views are stored.
app.set('views', path.join(__dirname, 'views'))

app.use(express.urlencoded({ extended: false }))

app.use(initializeTestUser)

// Used for serving public static files.
app.use(express.static(path.join(__dirname, 'public')))

app.use('/admin', adminRoutes)
app.use('/', shopRoutes)
app.use('/', authRoutes)

//app.use(errorController.get404)

mongoose
    .connect(databaseUrl(), connectOptions)
    .then(() => {
        createTestUser()
        app.listen(3000)
    })
    .catch((error) => console.log(error))
