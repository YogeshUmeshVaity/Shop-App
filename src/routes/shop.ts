import express, { Request, Response } from 'express'

export const shopRoutes = express.Router()

shopRoutes.get('/', (request: Request, response: Response) => {
  response.send(`<h1>Hello from Express!</h1>`)
})
