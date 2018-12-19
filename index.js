require('dotenv').config()

const Linkedin = require('node-linkedin')(process.env.APP_ID, process.env.SECRET)
const path = require('path')
const express = require('express')
const app = express()
let api = null
const scope = ['r_basicprofile']

app.use(require('morgan')('dev'))

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'))
})

app.get('/auth', function (req, res, next) {
  Linkedin.setCallback(req.protocol + '://' + req.headers.host + '/auth/cb')
  Linkedin.auth.authorize(res, scope)
})

app.get('/auth/cb', function (req, res, next) {
  Linkedin.auth.getAccessToken(res, req.query.code, req.query.state, function (err, results) {
    if (err) {
      console.error(err)
      return res.status(400).send(err)
    }

    api = Linkedin.init(results.access_token)
    res.redirect('/')
  })
})

app.get('/isAuthorized', function (req, res, next) {
  return res.json({ isAuthorized: !!api })
})

app.get('/profile', (req, res) => {
  if (!api) {
    return res.json({ error: 'User not authorized' })
  }

  api.people.me(function (err, $in) {
    if (err) {
      res.json({ err })
    } else {
      res.json($in)
    }
  })
})

app.listen(process.env.PORT || 3000)
