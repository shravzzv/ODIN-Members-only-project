const asyncHandler = require('express-async-handler')
const { body, validationResult, matchedData } = require('express-validator')
const User = require('../models/user')
const Message = require('../models/message')
const multerUtils = require('../utils/multer.util')
const handleImage = require('../middlewares/handleImage.middleware')
const bcrypt = require('bcryptjs')
const passport = require('passport')

// The landing page home.
exports.index = (req, res) => {
  res.render('landing/index', { title: 'Clubcord' })
}

// Display signup form on GET.
exports.usersignupGet = (req, res) => {
  res.render('landing/signupForm', { title: 'Sign Up' })
}

// Handle signup on POST.
exports.userSignupPost = [
  // upload image using multer
  multerUtils.upload.single('file'),

  // use middleware to handle the uploaded image
  handleImage,

  // validate and sanitize fields all User fields except "profilePicUrl" and "messages" because we're using matchedData() to create the new User object
  body('firstName')
    .trim()
    .isLength({ min: 3 })
    .withMessage('First name must be atleast 3 characters long.')
    .bail()
    .isLength({ max: 20 })
    .withMessage('First name must be a maximum of 20 characters long.')
    .escape(),

  body('lastName')
    .trim()
    .isLength({ min: 3 })
    .withMessage('Last name must be atleast 3 characters long.')
    .bail()
    .isLength({ max: 20 })
    .withMessage('Last name must be a maximum of 20 characters long.')
    .escape(),

  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email must not be empty.')
    .bail()
    .isEmail()
    .withMessage('Email is not a valid email address.')
    .escape()
    .custom(async (email) => {
      const existingUser = await User.findOne({ email }, '_id')
      if (existingUser) throw new Error(`E-mail "${email}" is already in use.`)
    }),

  body('username')
    .trim()
    .isLength({ min: 3 })
    .withMessage('username must be atleast 3 characters long.')
    .bail()
    .isLength({ max: 20 })
    .withMessage('username must be a maximum of 20 characters long.')
    .escape()
    .custom(async (username) => {
      const existingUser = await User.findOne({ username }, '_id')
      if (existingUser)
        throw new Error(`Username "${username}" is already in use.`)
    }),

  body('password')
    .trim()
    .isLength({ min: 8 })
    .withMessage('Password must be atleast 8 characters long.'),

  body('passwordConfirm')
    .trim()
    .notEmpty()
    .withMessage('Password confirm must not be empty.')
    .bail()
    .custom((value, { req }) => {
      return value === req.body.password
    })
    .withMessage(`Password confirm doesn't match the password.`),

  body('dateOfBirth')
    .isDate()
    .withMessage('Date of Birth should be a valid date.')
    // if dob is empty, it causes type error with the Schema
    .default(new Date(0)),

  body('bio').trim().optional().escape(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req)

    // create User object with sanitized data
    const user = new User({
      ...matchedData(req, { onlyValidData: false }),
      profilePicUrl: req.uploadedUrl || '', // from the handleImage middleware
    })
    // onlyValidData is not allowed here for showing erronours inputs in the error output (for eg. show already existing email that was input). Invalid values will never be saved in the db because when invalid values are present, the 'errors' array will be true which displays the error page.

    if (errors.isEmpty() && !req.imageError) {
      // hash the user password
      const hashedPassword = await bcrypt.hash(matchedData(req).password, 10)
      user.password = hashedPassword

      await user.save()
      next()
    } else {
      const allErrors = errors.array()
      if (req.imageError) allErrors.push(req.imageError)

      // set the entered value for password confirm for re-displaying in error
      user.passwordConfirm = req.body.passwordConfirm

      res.render('landing/signupForm', {
        title: 'Sign Up Error',
        user,
        errors: allErrors,
      })
    }
  }),

  passport.authenticate('local', {
    // If a user is successfuly signed up, authentication never fails because it uses the same username and password from the saved database document. If user fails to signup correctly, this middleware never gets executed due to the conditions in the above middleware.

    successRedirect: '/dashboard',
  }),
]

// Display signin form on GET.
exports.userSigninGet = (req, res) => {
  const errors = req?.session?.messages?.slice(-1)
  // Here, errors needs to only handle invalid passwords because username errors are handled directly in the userSigninPost method. Passport pushes the error message to the req.session.messages, and we're only getting the latest error message.

  res.render('landing/signinForm', {
    title: 'Sign In',
    errors,
  })
}

// Handle signin on POST.
exports.userSigninPost = [
  body('username')
    .trim()
    .isLength({ min: 3 })
    .withMessage('username must be atleast 3 characters long.')
    .bail()
    .isLength({ max: 20 })
    .withMessage('username must be a maximum of 20 characters long.')
    .escape()
    .custom(async (username) => {
      const user = await User.findOne({ username }, '_id')
      if (!user) throw new Error(`Username "${username}" doesn't exist.`)
    }),

  body('password')
    .trim()
    .isLength({ min: 8 })
    .withMessage('Password must be atleast 8 characters long.'),

  asyncHandler((req, res, next) => {
    const errors = validationResult(req)

    if (errors.isEmpty()) {
      next()
    } else {
      const { username, password } = matchedData(req, { onlyValidData: false })

      res.render('landing/signinForm', {
        title: 'Sign In Error',
        errors: errors.array(),
        username,
        password,
      })
    }
  }),

  passport.authenticate('local', {
    failureRedirect: '/signin',
    successRedirect: '/dashboard',
    failureMessage: true,
  }),
]

// Handle logout on GET.
exports.userLogoutGET = asyncHandler(async (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err)
    res.redirect('/signin')
  })
})
