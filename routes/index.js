const express = require('express')
const router = express.Router()
const userController = require('../controllers/userController')
const authMiddleware = require('../middlewares/auth.middleware')

// GET landing page.
router.get('/', authMiddleware.redirectOnAuth, userController.index)

// GET request for creating a User.
router.get(
  '/signup',
  authMiddleware.redirectOnAuth,
  userController.usersignupGet
)

// POST request for creating a User.
router.post(
  '/signup',
  authMiddleware.redirectOnAuth,
  userController.userSignupPost
)

// GET request for logging in a User.
router.get(
  '/signin',
  authMiddleware.redirectOnAuth,
  userController.userSigninGet
)

// POST request for logging in a User.
router.post(
  '/signin',
  authMiddleware.redirectOnAuth,
  userController.userSigninPost
)

// GET request to handle forgotten password.
router.get(
  '/password/forgot',
  authMiddleware.redirectOnAuth,
  userController.passwordForgotGetLanding
)

// POST request to handle forgotten password email.
router.post(
  '/password/forgot/email',
  authMiddleware.redirectOnAuth,
  userController.passwordForgotEmailPostLanding
)

// POST request to handle forgotten password email code.
router.post(
  '/password/forgot/code',
  authMiddleware.redirectOnAuth,
  userController.passwordForgotCodePostLanding
)

// POST request to create new password.
router.post(
  '/password/forgot/newpassword',
  authMiddleware.redirectOnAuth,
  userController.passwordForgotNewPasswordPostLanding
)

// redirect for common synonyms
router.get('/register', (req, res) => res.redirect('signup'))
router.get('/login', (req, res) => res.redirect('signin'))

// redirect on non-exisent routes
router.get('/password', (req, res) => res.redirect('/signin'))

module.exports = router
