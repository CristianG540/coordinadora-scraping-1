import express from 'express'
import compression from 'compression' // compresses requests
import session from 'express-session'
import bodyParser from 'body-parser'
// import lusca from 'lusca'
// import mongo from 'connect-mongo'
import flash from 'express-flash'
import path from 'path'
// import mongoose from 'mongoose'
// import passport from 'passport'
// import bluebird from 'bluebird'
import { SESSION_SECRET } from './util/secrets'

// Routes
import routes from './routes'

// // API keys and Passport configuration
// import * as passportConfig from './config/passport'

// const MongoStore = mongo(session)

// Create Express server
const app = express()

// // Connect to MongoDB
// const mongoUrl = MONGODB_URI
// mongoose.Promise = bluebird

// mongoose.connect(mongoUrl, { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true }).then(
//   () => { /** ready to use. The `mongoose.connect()` promise resolves to undefined. */ }
// ).catch(err => {
//   console.log('MongoDB connection error. Please make sure MongoDB is running. ' + err)
//   // process.exit();
// })

// Express configuration
app.set('port', process.env.PORT || 3000)

// view engine setup
app.set('views', path.join(__dirname, '../views'))
app.set('view engine', 'pug')

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
  // store: new MongoStore({
  //   url: mongoUrl,
  //   autoReconnect: true
  // })
}))

// app.use(passport.initialize())
// app.use(passport.session())

// The flash middleware let's us use req.flash('error', 'Shit!'), which will then pass that message to the next page the user requests
app.use(flash())

// app.use(lusca.xframe('SAMEORIGIN'))
// app.use(lusca.xssProtection(true))

// pass variables to our templates + all requests
app.use((req, res, next) => {
  // res.locals.user = req.user
  res.locals.flashes = req.flash()
  res.locals.currentPath = req.path
  next()
})

// app.use((req, res, next) => {
//   // After successful login, redirect back to the intended page
//   if (!req.user &&
//     req.path !== '/login' &&
//     req.path !== '/signup' &&
//     !req.path.match(/^\/auth/) &&
//     !req.path.match(/\./)) {
//     req.session.returnTo = req.path
//   } else if (req.user &&
//     req.path == '/account') {
//     req.session.returnTo = req.path
//   }
//   next()
// })

// After allllll that above middleware, we finally handle our own routes!
app.use('/', routes)

export default app
