const express = require('express')
const router = express.Router()
const authMiddleware = require('../middlewares/auth.middleware')
const messageController = require('../controllers/messageController')
const userController = require('../controllers/userController')

// * all routes in this file need authentication
router.use(authMiddleware.protect)

// GET dashboard home page.
router.get('/', messageController.index)

// * dashboard/compose routes

// GET request for creating a Message.
router.get('/compose', messageController.composeGet)

// POST request for creating a Message.
router.post('/compose', messageController.composePost)

// * dashboard/messages routes

// GET request to delete a Message.
router.get('/message/:id/delete', messageController.messageDeleteGet)

// POST request to delete a Message.
router.post('/message/:id/delete', messageController.messageDeletePost)

// GET request to update a Message.
router.get('/message/:id/update', messageController.messageUpdateGet)

// POST request to update a Message.
router.post('/message/:id/update', messageController.messageUpdatePost)

// * dashboard/profile routes
// profile means the logged in user, accessible via req.user

// Get request for the authenticated user.
router.get('/profile', userController.profile)

// POST request for logging out the autenticated user.
router.post('/profile/logout', userController.userLogoutPost)

// GET request to delete the profile.
router.get('/profile/delete', userController.profileDeleteGet)

// POST request to delete the profile.
router.post('/profile/delete', userController.profileDeletePost)

// GET request to update the profile.
router.get('/profile/update', userController.profileUpdateGet)

// POST request to update a User.
router.post('/profile/update', userController.profileUpdatePost)

// * dashboard/password routes

// GET request to update the password.
router.get('/password/update', userController.passwordUpdateGet)

// POST request to update the password.
router.post('/password/update', userController.passwordUpdatePost)

// The user needs to know the current password inorder to update his password. If they don't, forgot password is used.

// GET request to handle forgotten password.
router.get('/password/forgot', userController.passwordForgotGet)

// POST request to handle forgotten password email code.
router.post('/password/forgot/code', userController.passwordForgotCodePost)

// POST request to create new password.
router.post(
  '/password/forgot/newpassword',
  userController.passwordForgotNewPasswordPost
)

// * dashboard/user routes

// GET request for one User.
// If there are any routes that are of the form '/user/something', this routes should come after that.
router.get('/user/:id', userController.userDetail)

// * The below routes should only be accessible to the admin.

// GET request to delete a User.
router.get('/user/:id/delete', userController.userDeleteGet)

// POST request to delete a User..
router.post('/user/:id/delete', userController.userDeletePost)

// GET request to update a User.
router.get('/user/:id/update', userController.userUpdateGet)

// POST request to update a User.
router.post('/user/:id/update', userController.userUpdatePost)

// * dashboard/club routes

// Get request for the club page.
router.get('/club', userController.clubGet)

// POST request for adding a user to the club.
router.post('/club/join', userController.clubJoinPost)

// POST request for adding a user to the club.
router.post('/club/leave', userController.clubLeavePost)

// * dashboard/search routes

// Get request for the search page
router.get('/search', userController.searchGet)

// Post request for the search page
router.post('/search', userController.searchPost)

module.exports = router
