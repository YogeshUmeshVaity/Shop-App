import express, { Request, Response } from 'express'

export const adminRoutes = express.Router()

adminRoutes.get('/add-product', (request: Request, response: Response) => {
  response.send(
    '<form action="/admin/product" method="POST"><input type="text" name="title"><button type="submit">Add Product</button></form>'
  )
})

adminRoutes.post('/product', (request: Request, response: Response) => {
  console.log(request.body)
  response.redirect('/')
})
