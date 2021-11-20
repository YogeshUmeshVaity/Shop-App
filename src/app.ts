import express from 'express'
import { adminRoutes } from './routes/admin'
import { shopRoutes } from './routes/shop'
import { authRoutes } from './routes/authentication'
import path from 'path'
import dotenv from 'dotenv'
import { connectOptions, databaseUrl } from './lib/database'
import mongoose from 'mongoose'
import csrf from 'csurf'
import flash from 'connect-flash'
import multer from 'multer'
import { fileFilter, fileStorage } from './lib/multer'
import helmet from 'helmet'
import compression from 'compression'
import https from 'https'

// Controllers
import * as errorController from './controllers/error'
import { addLocals, initializeUser } from './controllers/admin'
import { initializeSession } from './controllers/authentication'
import { morganMiddleware } from './middleware/morgan'
import helmetCSP from './lib/helmetCSP'

const app = express()
const csrfProtection = csrf()

// Load environment variables from a .env file
dotenv.config()

// Set the rendering engine to be used.
app.set('view engine', 'ejs')

// Set the name of the directory where views are stored.
app.set('views', path.join(__dirname, 'views'))

// Helmet helps in securing the apps by setting various HTTP headers. function is a wrapper around
// 15 smaller middleware functions, 11 of which are enabled by default.
app.use(helmet())

// A Customized helmet middleware for Content-Security-Policy header.
app.use(helmetCSP)

// Compresses the response body and asset sizes upto 70%. So users have to download less data.
// Disable this, if your hosting provider provides compression from their end.
app.use(compression())

// Used for serving public static files. Express assumes that the files are served from the root
// directory. That means the directory 'public' is not included in the path.
// If you want the 'public' directory included, mention that initially like:
// app.use('/public', express.static(path.join(__dirname, 'public')))
app.use(express.static(path.join(__dirname, 'public')))
app.use(express.static(path.join(__dirname, 'images')))

// Log the http request with Morgan. This should be used after express.static otherwise the static
// assets will also be logged. The static assets that don't exist are still logged.
app.use(morganMiddleware)

// Text, number, url or plaintext
// Content-type: application/x-www-form-urlencoded.
// It tries to put all data into its body as text. Images and files are not supported.
app.use(express.urlencoded({ extended: false }))

// Look for a single uploaded file.
app.use(multer({ storage: fileStorage, fileFilter: fileFilter }).single('image'))

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
app.use(errorController.logErrors)
app.use(errorController.handleErrors)

// Generally hosting provider configures the SSL/TLS encryption. When we need to manually configure
// the SSL, uncomment the https line and remove the 'app' from app.listen.
// Also don't forget import sslPrivateKey and sslCertificate from util/ssl.ts
mongoose
    .connect(databaseUrl(), connectOptions)
    .then(() => {
        // https.createServer({ key: sslPrivateKey, cert: sslCertificate }, app)
        app.listen(process.env.PORT || 3000)
    })
    .catch((error) => console.log(error))
