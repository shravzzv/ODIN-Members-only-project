const express = require('express')
const router = express.Router()
const userController = require('../controllers/userController')

// GET landing page.
router.get('/', userController.index)

// GET request for creating a User.
router.get('/signup', userController.usersignupGet)

// POST request for creating a User.
router.post('/signup', userController.userSignupPost)

// GET request for logging in a User.
router.get('/signin', userController.userSigninGet)

// POST request for logging in a User.
router.post('/signin', userController.userSigninPost)

// GET request for logging out a User.
router.get('/logout', userController.userLogoutGET)

// redirect for common synonyms
router.get('/register', (req, res) => res.redirect('signup'))
router.get('/login', (req, res) => res.redirect('signin'))

module.exports = router
