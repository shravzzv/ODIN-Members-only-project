const asyncHandler = require('express-async-handler')
const { body, validateRequest } = require('express-validator')
const User = require('../models/user')
const Message = require('../models/message')

// The landing page home.
exports.index = (req, res) => {
  res.render('landing/index', { title: 'Clubcord' })
}

// Display signup form on GET.
exports.usersignupGet = (req, res) => {
  res.render('landing/signupForm', { title: 'Sign Up' })
}

// Handle signup on POST.
exports.userSignupPost = []

// Display signin form on GET.
exports.userSigninGet = (req, res) => {
  res.render('landing/signinForm', { title: 'Sign In' })
}

// Handle signin on POST.
exports.userSigninPost = []

// Handle logout on GET.
exports.userLogoutGET = asyncHandler(async (req, res, next) => {
  res.send('user logout get not implemented')
})
