import express, { Request, Response } from 'express'

const app = express()

app.get('/', (request: Request, response: Response) => {
  response.send(`Welcome to Express!`)
})

app.listen(3000)
