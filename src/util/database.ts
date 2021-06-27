// mysql2 comes with built-in type definitions for Typescript.
import mysql from 'mysql2'

// TODO: Use dotenv to get the password from a file that is not committed in the version control.
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    database: 'node-complete',
    password: '1234567#'
})

export const databasePool = pool.promise()
