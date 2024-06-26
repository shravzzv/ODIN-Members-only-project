const createError = require('http-errors')
const express = require('express')
const path = require('path')
const cookieParser = require('cookie-parser')
const logger = require('morgan')
const passport = require('passport')
const session = require('express-session')
const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcryptjs')
const mongoose = require('mongoose')
const MongoStore = require('connect-mongo')
const compression = require('compression')
const helmet = require('helmet')
const RateLimit = require('express-rate-limit')
require('dotenv').config()

require('./config/db.config')
require('./config/cloudinary.config')
const User = require('./models/user')
const indexRouter = require('./routes/index')
const dashboardRouter = require('./routes/dashboard')

const app = express()

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'pug')

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))
app.use(compression()) // Compress all routes

// Add helmet CSP.
app.use(
  helmet.contentSecurityPolicy({
    useDefaults: true,
    directives: {
      'script-src': ["'self'"],
      'font-src': ['fonts.gstatic.com'],
      'img-src': ["'self'", 'res.cloudinary.com'],
      'style-src': ["'self'", 'cdnjs.cloudflare.com', 'fonts.googleapis.com'],
    },
    reportOnly: false,
  })
)

const limiter = RateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 50,
})
// Apply rate limiter to all requests
app.use(limiter)

// set up authentication middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({ client: mongoose.connection.getClient() }),
  })
)
app.use(passport.session())
passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const user = await User.findOne({ username }, '_id password')
      if (!user)
        return done(null, false, {
          message: `User with username "${username}" doesn't exist.`,
        })

      const match = await bcrypt.compare(password, user.password)
      if (!match)
        return done(null, false, {
          path: 'password',
          msg: `Incorrect password.`,
        })
      // errors are sent this way to match express-validator error structure

      return done(null, user)
    } catch (error) {
      return done(error)
    }
  })
)
passport.serializeUser((user, done) => {
  try {
    return done(null, user.id)
  } catch (error) {
    return done(error)
  }
})
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id)
    return done(null, user)
  } catch (error) {
    return done(error)
  }
})

app.use('/', indexRouter)
app.use('/dashboard', dashboardRouter)

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404))
})

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  // render the error page
  res.status(err.status || 500)
  res.render('error', { title: 'Error' })
})

module.exports = app
