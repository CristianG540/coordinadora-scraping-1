import express from 'express'
import fs from 'fs'
import compression from 'compression' // compresses requests
import session from 'express-session'
import bodyParser from 'body-parser'
import flash from 'express-flash'
import path from 'path'
import morgan from 'morgan'
// Routes
import routes from '@routes/index'
// Handlers
import { notFound, developmentErrors, productionErrors } from '@handlers/errorHandlers'
// Utils
import { SESSION_SECRET } from '@util/enviroment'

// Create Express server
const app = express()

// Express configuration
app.set('port', process.env.PORT || 3000)

// view engine setup
app.set('views', path.join(__dirname, '../views'))
app.set('view engine', 'pug')

// create a write stream (in append mode) and setup the http logger
const accessLogStream = fs.createWriteStream(path.join(__dirname, '../access.log'), { flags: 'a' })
app.use(morgan('dev'))
app.use(morgan('combined', { stream: accessLogStream }))

// serves up static files from the public folder. Anything in public/ will just be served up as the file it is
app.use(
  express.static(path.join(__dirname, 'public'), { maxAge: 31557600000 })
)

app.use(compression())

// Takes the raw requests and turns them into usable properties on req.body
// parse application/json
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

// Sessions allow us to store data on visitors from request to request
// This keeps users logged in and allows us to send flash messages
app.use(session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: true
}))

// The flash middleware let's us use req.flash('error', 'Shit!'), which will then pass that message to the next page the user requests
app.use(flash())

// pass variables to our templates + all requests
app.use((req, res, next) => {
  // res.locals.user = req.user
  res.locals.flashes = req.flash()
  res.locals.currentPath = req.path
  next()
})

// After allllll that above middleware, we finally handle our own routes!
app.use('/', routes)

// If that above routes didnt work, we 404 them and forward to error handler
app.use(notFound)

// Otherwise this was a really bad error we didn't expect! Shoot eh
if (process.env.NODE_ENV === 'development') {
  /* Development Error Handler - Prints stack trace */
  app.use(developmentErrors)
}

// production error handler
app.use(productionErrors)

export default app
