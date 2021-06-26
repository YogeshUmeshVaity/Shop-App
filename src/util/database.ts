// mysql2 comes with built-in type definitions for Typescript.
import mysql from 'mysql2'

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    database: 'node-complete',
    password: '1234567#'
})

export const databasePool = pool.promise()
