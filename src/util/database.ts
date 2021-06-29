// Setup instructions for sequelize-typescript can be found at:
// https://github.com/RobinBuschmann/sequelize-typescript

import { Sequelize } from 'sequelize-typescript'
import { Product } from '../models/product'

// TODO: Use dotenv to get the password from a file that is not committed in the version control.
export const sequelize = new Sequelize({
    database: 'node-complete',
    dialect: 'mysql',
    host: 'localhost',
    username: 'root',
    password: '1234567#',
    models: [Product] // Every newly added model(table) should be added here.
})
