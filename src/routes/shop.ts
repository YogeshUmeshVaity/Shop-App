import express, { Request, Response } from 'express'

export const shopRoutes = express.Router()

shopRoutes.get('/', function (request: Request, response: Response) {
  response.send(`<h1>Hello from Express!</h1>`)
})
