import express from 'express'
import { adminRoutes } from './routes/admin'
import { shopRoutes } from './routes/shop'
import { authRoutes } from './routes/authentication'
import path from 'path'
import dotenv from 'dotenv'
import { connectOptions, databaseUrl } from './util/database'
import mongoose from 'mongoose'
import csrf from 'csurf'
import flash from 'connect-flash'
import multer from 'multer'

// Controllers
import * as errorController from './controllers/error'
import { addLocals, initializeUser } from './controllers/admin'
import { initializeSession } from './controllers/authentication'
import { fileStorage } from './util/multer'

const app = express()
const csrfProtection = csrf()

// Load environment variables from a .env file
dotenv.config()

// Set the rendering engine to be used.
app.set('view engine', 'ejs')

// Set the name of the directory where views are stored.
app.set('views', path.join(__dirname, 'views'))

// Text, number, url or plaintext
// Content-type: application/x-www-form-urlencoded.
// It tries to put all data into its body as text. Images and files are not supported.
app.use(express.urlencoded({ extended: false }))

// Look for the single uploaded file.
app.use(multer({ storage: fileStorage }).single('image'))

// Initialize session.
app.use(initializeSession)

// Must be used right after initializing the session.
app.use(csrfProtection)

// Used for flashing the messages for the user.
app.use(flash())

// Add user object on the request object.
app.use(initializeUser)

// Adds frequently required data all at once to the view for every request.
app.use(addLocals)

// Used for serving public static files.
app.use(express.static(path.join(__dirname, 'public')))

app.use('/admin', adminRoutes)
app.use('/', shopRoutes)
app.use('/', authRoutes)

app.get('/500', errorController.get500)

app.use(errorController.get404)

/**
 * Since Express runs all the middleware from the first to the last, your error handlers should be
 * at the end of your application stack. If you pass the error to the next function, the framework
 * omits all the other middleware in the chain and skips straight to the error handling middleware
 * which is recognized by the fact that it has four arguments.
 */
app.use(errorController.handleErrors)

mongoose
    .connect(databaseUrl(), connectOptions)
    .then(() => {
        // createTestUser()
        app.listen(3000)
    })
    .catch((error) => console.log(error))
