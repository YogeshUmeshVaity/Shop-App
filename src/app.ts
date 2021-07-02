import express, { NextFunction, Request, Response } from 'express'
import { adminRoutes } from './routes/admin'
import { shopRoutes } from './routes/shop'
import path from 'path'

// Controllers
import * as errorController from './controllers/error'
import { db } from './util/database'

const app = express()

// Set the rendering engine to be used.
app.set('view engine', 'ejs')

// Set the name of the directory where views are stored.
app.set('views', path.join(__dirname, 'views'))

app.use(express.urlencoded({ extended: false }))

app.use(async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
        const user = await db.user.findUnique({ where: { id: '1' }, rejectOnNotFound: true })
        request.user = user
        next()
    } catch (error) {
        next(error)
    }
})

// Used for serving public static files.
app.use(express.static(path.join(__dirname, 'public')))

app.use('/admin', adminRoutes)
app.use('/', shopRoutes)

app.use(errorController.get404)

app.listen(3000)

// sequelize
//     .sync({ force: true })
//     .then((result) => {
//         console.log(result)
//         app.listen(3000)
//     })
//     .catch((err) => console.log(err))
