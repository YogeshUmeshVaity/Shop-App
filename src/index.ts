import express from 'express'
const app = express()

app.get(
  '/user/:id',
  function (req, res, next) {
    console.log('before request handler function 1')
    next('route')
  },
  function (req, res, next) {
    // Won't reach here.
    console.log('before request handler function 2')
    next()
  }
)

app.get('/user/:id', function (req, res, next) {
  console.log('handling request')
  res.sendStatus(200)
  // This won't make any difference, since there is just one function.
  // This should be next()
  next('route')
})

app.get('/user/:id', function (req, res, next) {
  console.log('after request handler')
  next()
})

app.listen(3000)
