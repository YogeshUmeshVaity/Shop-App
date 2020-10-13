import express, { Request, Response } from 'express'
const app = express()

app.get('/', function (request: Request, response: Response) {
  response.send(`<h1>Hello from Express!</h1>`)
})

app.get('/add-product', (request: Request, response: Response) => {
  response.send(
    '<form action="/product" method="POST"><input type="text" name="title"><button type="submit">Add Product</button></form>'
  )
})

app.post('/product', (request: Request, response: Response) => {
  console.log(request.body)
  response.redirect('/')
})

app.listen(3000)
