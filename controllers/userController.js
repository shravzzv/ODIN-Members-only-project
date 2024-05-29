const asyncHandler = require('express-async-handler')
const {
  body,
  query,
  validationResult,
  matchedData,
} = require('express-validator')
const User = require('../models/user')
const Message = require('../models/message')
const multerUtils = require('../utils/multer.util')
const cloudinaryUtils = require('../utils/cloudinary.util')
const nodemailerUtils = require('../utils/nodemailer.util')
const handleImage = require('../middlewares/handleImage.middleware')
const bcrypt = require('bcryptjs')
const passport = require('passport')
const otpGenerator = require('otp-generator')

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
      if (existingUser) throw new Error(`E-mail already in use.`)
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
      if (existingUser) throw new Error(`Username already in use.`)
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
    .withMessage(`Doesn't match the password.`),

  body('dateOfBirth')
    .optional({ values: 'falsy' })
    .isDate()
    .withMessage('Date of Birth should be a valid date.'),

  body('bio').trim().optional().escape(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req)

    // create User object with sanitized data
    const user = new User({
      ...matchedData(req, { onlyValidData: false, includeOptionals: true }),
      profilePicUrl: req.uploadedUrl || '', // from the handleImage middleware
    })
    // onlyValidData is not allowed here for showing erronous inputs in the error output (for eg. show already existing email that was input). Invalid values will never be saved in the db because when invalid values are present, the 'errors' array will be true which displays the error page.

    if (errors.isEmpty() && !req.imageError) {
      // hash the user password
      const hashedPassword = await bcrypt.hash(matchedData(req).password, 10)
      user.password = hashedPassword

      await user.save()
      next()
    } else {
      const allErrors = errors.array()
      if (req.imageError)
        allErrors.push({
          msg: req.imageError.message,
          path: 'file',
        })

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
  res.render('landing/signinForm', {
    title: 'Sign In',
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
      if (!user) throw new Error(`Username doesn't exist.`)
    }),

  body('password')
    .trim()
    .isLength({ min: 8 })
    .withMessage('Password must be atleast 8 characters long.'),

  asyncHandler(async (req, res, next) => {
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

  asyncHandler(async (req, res, next) => {
    // passport.authenticate with a custom callback function
    passport.authenticate('local', function (err, user, info) {
      if (err) return next(err)
      if (!user)
        return res.render('landing/signinForm', {
          title: 'Sign In Error',
          errors: [info],
          username: req.body.username,
          password: req.body.password,
        })

      req.logIn(user, (err) => {
        if (err) return next(err)
        return res.redirect('/dashboard')
      })
    })(req, res, next)
  }),
]

// Handle logout on POST.
exports.userLogoutPost = asyncHandler(async (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err)
    res.redirect('/signin')
  })
})

// Display the authenticated user profile on GET.
exports.profile = asyncHandler(async (req, res) => {
  const messages = await Message.find({ user: req.user.id }).populate(
    'user',
    '_id'
  )

  res.render('dashboard/profile', {
    title: req.user.fullName,
    user: req.user,
    messages,
    isProfile: true,
  })
})

// Get details of a one user.
exports.userDetail = asyncHandler(async (req, res) => {
  if (!req.user.isClubMember) return res.redirect('/dashboard')

  if (req.params.id === req.user.id) return res.redirect('/dashboard/profile')

  const [user, messages] = await Promise.all([
    User.findById(req.params.id),
    Message.find({ user: req.params.id }),
  ])

  res.render('dashboard/profile', {
    title: `${user.username}'s profile`,
    user,
    messages,
    isProfile: false,
  })
})

// Display the club join page on GET.
exports.clubGet = asyncHandler(async (req, res) => {
  res.render('dashboard/club', { title: 'Club', user: req.user })
})

// Handle club join on POST.
exports.clubJoinPost = [
  // validate and sanitize the data
  body('secret', 'Invalid secret.')
    .trim()
    .toInt()
    .escape()
    .isLength({ min: 4, max: 4 })
    .withMessage('The secret is a 4 digit number.')
    .bail()
    .custom((value) => parseInt(value) === 1758)
    .withMessage('The secret is incorrect.'),

  asyncHandler(async (req, res) => {
    const errors = validationResult(req)

    if (errors.isEmpty()) {
      // update user to add them to the club
      await User.findByIdAndUpdate(req.user.id, {
        $set: { isClubMember: true },
      })
      res.redirect('/dashboard/club')
    } else {
      res.render('dashboard/club', {
        title: 'Joining club error',
        user: req.user,
        errors: errors.array(),
        secret: req.body.secret,
      })
    }
  }),
]

// Handle club leave on POST.
exports.clubLeavePost = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user.id, { $set: { isClubMember: false } })
  res.redirect('/dashboard/club')
})

// Display profile delete form on GET.
exports.profileDeleteGet = asyncHandler(async (req, res) => {
  // ? how do you check if the user is deleting their own account?
  // * profile delete and user delete are handled on separate routes!
  // When any user enters /dashboard/profile/delete, only their account will be present in the req.user. They aren't accessing any other users profile.

  const messages = await Message.find({ user: req.user.id }).populate(
    'user',
    '_id'
  )

  res.render('dashboard/profileDelete', {
    title: 'Delete your profile',
    user: req.user,
    messages,
  })
})

// Handle profile delete on POST.
exports.profileDeletePost = [
  // validate input
  body('confirmation')
    .trim()
    .custom((value) => value === 'delete my profile')
    .withMessage(`Please enter "delete my profile".`)
    .escape(),

  asyncHandler(async (req, res) => {
    const errors = validationResult(req)
    const sanitizedData = matchedData(req, { onlyValidData: false })

    if (errors.isEmpty()) {
      // delete user profilePicture from cloudinary if present
      if (req.user.profilePicUrl) {
        await cloudinaryUtils.deleteUploadedFile(req.user.profilePicUrl)
      }

      // delete user document from the database
      await User.findByIdAndDelete(req.user.id)

      // logout user
      req.logout((err) => {
        if (err) return next(err)
        res.redirect('/')
      })
    } else {
      res.render('dashboard/profileDelete', {
        title: 'Delete profile error',
        errors: errors.array(),
        confirmation: sanitizedData.confirmation,
      })
    }
  }),
]

// Display profile update form on GET.
exports.profileUpdateGet = (req, res) => {
  res.render('dashboard/userForm', { title: 'Update profile', user: req.user })
}

// Handle profile update on POST.
exports.profileUpdatePost = [
  multerUtils.upload.single('file'),
  handleImage,

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
    .custom(async (email, { req }) => {
      // check if the new email address entered is unique
      // you may need to remove the user's current email from this check to remove a flase positive
      // if the user doesn't choose to change it, don't throw error

      const existingEmail = req.user.email
      if (email === existingEmail) return true

      // now that the new email is not the same as the user's previous email which hasn't been updated in the db yet, check it with the rest of the db.

      const existingUser = await User.findOne({ email }, '_id')
      if (existingUser) throw new Error(`E-mail already in use.`)
    }),

  body('username')
    .trim()
    .isLength({ min: 3 })
    .withMessage('username must be atleast 3 characters long.')
    .bail()
    .isLength({ max: 20 })
    .withMessage('username must be a maximum of 20 characters long.')
    .escape()
    .custom(async (username, { req }) => {
      const currentUsername = req.user.username
      if (username === currentUsername) return true

      const existingUser = await User.findOne({ username }, '_id')
      if (existingUser) throw new Error(`Username already in use.`)
    }),

  body('dateOfBirth')
    .optional({ values: 'falsy' })
    .isDate()
    .withMessage('Date of Birth should be a valid date.'),

  body('bio').trim().optional().escape(),

  asyncHandler(async (req, res) => {
    const errors = validationResult(req)

    const sanitizedData = matchedData(req, {
      onlyValidData: false,
      includeOptionals: true,
    })

    const user = new User({
      ...req.user._doc,
      ...sanitizedData,
      profilePicUrl: req.uploadedUrl,
    })

    // !problem: When a user updates their profile picture, but there are other errors in the form, then the new picture gets uploaded in the cloud and the old one gets deleted due to the handleImage middleware, but it doesn't get stored in the database until the form is submitted correctly without any errors. Now if the user moves away from the form without correcting any other changes, their profile picture will be lost because the database points to a url that was deleted.
    // solution: if profilepicture is updated, saved the new profile picture url in the database immediately; req.user.profilePicUrl is the old image url and req.uploadedUrl is the new image url.
    if (req.uploadedUrl && req.uploadedUrl !== req.user.profilePicUrl) {
      await User.findByIdAndUpdate(req.user.id, {
        $set: { profilePicUrl: req.uploadedUrl },
      })
    }

    if (errors.isEmpty() && !req.imageError) {
      await User.findByIdAndUpdate(req.user.id, user)
      res.redirect('/dashboard/profile')
    } else {
      const allErrors = errors.array()

      if (req.imageError)
        allErrors.push({
          msg: req.imageError.message,
          path: 'file',
        })

      res.render('dashboard/userForm', {
        title: 'Update profile error',
        user,
        errors: allErrors,
      })
    }
  }),
]

// Display password update form on GET.
exports.passwordUpdateGet = (req, res) => {
  res.render('dashboard/passwordForm', {
    title: 'Update password',
  })
}

// Handle password update on POST.
exports.passwordUpdatePost = [
  body('currentPassword')
    .trim()
    .isLength({ min: 8 })
    .withMessage('Current password must be atleast 8 characters long.')
    .bail()
    .custom(async (password, { req }) => {
      // check if the current password is correct
      req.passwordMatch = await bcrypt.compare(password, req.user.password)
      if (!req.passwordMatch) throw new Error('Current password is incorrect.')
      else return true
    }),

  body('newPassword')
    .trim()
    .isLength({ min: 8 })
    .withMessage('New password must be atleast 8 characters long.')
    .bail()
    .custom((newPassword, { req }) => {
      if (req.passwordMatch && newPassword === req.body.currentPassword)
        throw new Error(`Shouldn't be the same as the current password.`)
      else return true
    }),

  body('passwordConfirm')
    .trim()
    .isLength({ min: 8 })
    .withMessage('Confirm new password must be atleast 8 characters long.')
    .bail()
    .custom((value, { req }) => {
      if (value !== req.body.newPassword)
        throw new Error(`Doesn't match the new password.`)
      else return true
    }),

  asyncHandler(async (req, res) => {
    const errors = validationResult(req)
    const sanitizedData = matchedData(req, { onlyValidData: false })

    if (errors.isEmpty()) {
      const hashedPassword = await bcrypt.hash(sanitizedData.newPassword, 10)

      await User.findByIdAndUpdate(req.user.id, {
        $set: {
          password: hashedPassword,
        },
      })

      res.redirect('/dashboard/profile')
    } else {
      // provide user-entered incorrect values back to them for correction
      const { currentPassword, newPassword, passwordConfirm } = sanitizedData

      res.render('dashboard/passwordForm', {
        title: 'Update password error',
        errors: errors.array(),
        currentPassword,
        newPassword,
        passwordConfirm,
      })
    }
  }),
]

// * Handle forgot password on the dashboard

// Display password forgot form on GET.
exports.passwordForgotGet = asyncHandler(async (req, res) => {
  const generateSecret = () => {
    // Generate a random alphanumeric string
    const otpLength = 6
    const characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz123456789'
    let otp = ''
    for (let i = 0; i < otpLength; i++) {
      otp += characters.charAt(Math.floor(Math.random() * characters.length))
    }
    return otp
  }

  passport.session.passwordSecret = generateSecret()
  await nodemailerUtils.sendMail(
    req.user.email,
    passport.session.passwordSecret
  )

  res.render('dashboard/passwordForgotCode', {
    title: 'Forgot password',
    email: req.user.email,
  })
})

// todo: Add OTP validation here
// Handle password forgot code on POST.
exports.passwordForgotCodePost = [
  body('secret')
    .trim()
    .escape()
    .isLength(6)
    .withMessage('Should be 6 characters long.')
    .custom((value) => {
      if (value !== passport.session.passwordSecret) {
        throw new Error('Incorrect OTP.')
      } else return true
    }),

  asyncHandler(async (req, res) => {
    if (req.body.secret !== passport.session.passwordSecret) {
      return res.render('dashboard/passwordForgotCode', {
        title: 'Forgot password error',
        email: req.user.email,
        error: 'Incorrect code.',
      })
    }

    res.render('dashboard/passwordForgotNewPassword', {
      title: 'Create new password',
    })
  }),
]

// Handle password forgot new password on POST.
exports.passwordForgotNewPasswordPost = [
  body('newPassword')
    .trim()
    .isLength({ min: 8 })
    .withMessage('New password must be atleast 8 characters long.'),

  body('passwordConfirm')
    .trim()
    .isLength({ min: 8 })
    .withMessage('Confirm new password must be atleast 8 characters long.')
    .bail()
    .custom((value, { req }) => {
      if (value !== req.body.newPassword)
        throw new Error(`Doesn't match the new password.`)
      else return true
    }),

  asyncHandler(async (req, res) => {
    const errors = validationResult(req)
    const sanitizedData = matchedData(req, { onlyValidData: false })

    if (errors.isEmpty()) {
      const hashedPassword = await bcrypt.hash(sanitizedData.newPassword, 10)

      await User.findByIdAndUpdate(req.user.id, {
        $set: {
          password: hashedPassword,
        },
      })

      res.redirect('/dashboard/profile')
    } else {
      // provide user-entered incorrect values back to them for correction
      const { newPassword, passwordConfirm } = sanitizedData

      res.render('dashboard/passwordForgotNewPassword', {
        title: 'Create new password error',
        errors: errors.array(),
        newPassword,
        passwordConfirm,
      })
    }
  }),
]

// Display the search page on GET.
// And handle search by tags.
exports.searchGet = [
  // sanitize query parameter
  query('tag').escape().trim().optional(),

  asyncHandler(async (req, res) => {
    if (req.query.tag) {
      const messages = await Message.find({ tags: req.query.tag }).populate(
        'user',
        'username profilePicUrl'
      )

      return res.render('dashboard/search', {
        messages,
        user: req.user,
        searchQuery: req.query.tag,
      })
    }

    res.render('dashboard/search', {
      user: req.user,
    })
  }),
]

// Handle search on POST.
exports.searchPost = [
  // sanitize user input
  body('searchQuery')
    .trim()
    .escape()
    .isLength({ min: 1 })
    .withMessage('Search query cannot be empty.'),

  asyncHandler(async (req, res) => {
    const errors = validationResult(req)
    const sanitizedData = matchedData(req, { includeOptionals: true })

    if (errors.isEmpty()) {
      const messages = await Message.aggregate().search({
        index: process.env.MONGO_ATLAS_SEARCH_INDEX,
        text: {
          query: sanitizedData.searchQuery,
          path: {
            wildcard: '*',
          },
        },
      })

      // populate the user for each message
      const populatedMessages = await Promise.all(
        messages.map(async (message) => {
          return await Message.findById(message._id).populate(
            'user',
            'username profilePicUrl'
          )
        })
      )

      res.render('dashboard/search', {
        messages: populatedMessages,
        user: req.user,
        searchQuery: sanitizedData.searchQuery,
      })
    } else {
      res.render('dashboard/search', {
        user: req.user,
        errors: errors.array(),
        searchQuery: sanitizedData.searchQuery,
      })
    }
  }),
]

// * handle forgot password on the landing page

// Display forgot password form on GET.
exports.passwordForgotGetLanding = (req, res) => {
  res.render('landing/passwordForgot', { title: 'Password forgot' })
}

// Handle password forgot email on POST.
exports.passwordForgotEmailPostLanding = [
  body('email')
    .trim()
    .escape()
    .isEmail()
    .withMessage('Email must be a valid email')
    .bail()
    .custom(async (email) => {
      const user = await User.findOne({ email }, '_id')
      if (!user) throw new Error(`"${email}" is not registered.`)
    }),

  asyncHandler(async (req, res) => {
    const errors = validationResult(req)
    const { email } = matchedData(req, { onlyValidData: false })

    if (errors.isEmpty()) {
      passport.session.passwordSecret = otpGenerator.generate(6)
      passport.session.email = email
      await nodemailerUtils.sendMail(email, passport.session.passwordSecret)
      res.render('landing/passwordEmailCode', { title: 'Enter OTP', email })
    } else {
      res.render('landing/passwordForgot', {
        title: 'Password forgot error',
        email,
        errors: errors.array(),
      })
    }
  }),
]

// Handle password forgot code on POST.
exports.passwordForgotCodePostLanding = [
  body('secret')
    .trim()
    .escape()
    .isLength(6)
    .withMessage('Should be 6 characters long.')
    .custom((value) => {
      if (value !== passport.session.passwordSecret) {
        throw new Error('Incorrect OTP.')
      } else return true
    }),

  asyncHandler(async (req, res) => {
    const errors = validationResult(req)
    const { secret } = matchedData(req, { onlyValidData: false })

    if (errors.isEmpty()) {
      res.render('landing/newPassword', {
        title: 'Create new password',
      })
    } else {
      res.render('landing/passwordEmailCode', {
        title: 'Incorrect OTP',
        errors: errors.array(),
        secret,
      })
    }
  }),
]

// Handle password forgot new password on POST.
exports.passwordForgotNewPasswordPostLanding = [
  body('newPassword')
    .trim()
    .isLength({ min: 8 })
    .withMessage('Must be atleast 8 characters long.'),

  body('passwordConfirm')
    .trim()
    .isLength({ min: 8 })
    .withMessage('Must be atleast 8 characters long.')
    .bail()
    .custom((value, { req }) => {
      if (value !== req.body.newPassword)
        throw new Error(`Doesn't match the new password.`)
      else return true
    }),

  asyncHandler(async (req, res) => {
    const errors = validationResult(req)
    const { newPassword, passwordConfirm } = matchedData(req, {
      onlyValidData: false,
    })

    if (errors.isEmpty()) {
      const hashedPassword = await bcrypt.hash(newPassword, 10)

      await User.updateOne(
        { email: passport.session.email },
        {
          $set: {
            password: hashedPassword,
          },
        }
      )

      delete passport.session.email
      delete passport.session.passwordSecret

      res.redirect('/signin')
    } else {
      res.render('landing/newPassword', {
        title: 'Create new password error',
        errors: errors.array(),
        newPassword,
        passwordConfirm,
      })
    }
  }),
]

// todo: use opt-generator for dashboard routes
// todo: update dashboard password forget routes
