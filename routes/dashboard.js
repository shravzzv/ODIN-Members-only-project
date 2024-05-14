const express = require('express')
const router = express.Router()
const authMiddleware = require('../middlewares/auth.middleware')
const messageController = require('../controllers/messageController')
const userController = require('../controllers/userController')

// * all routes in this file need authentication
router.use(authMiddleware.protect)

// * dashboard route

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

// GET request for one Message.
router.get('/message/:id', messageController.messageDetailGet)

// GET request for a list of all Messages.
router.get('/messages', (req, res) => res.redirect('/dashboard'))

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

// * dashboard/user routes

// GET request for one User.
router.get('/user/:id', userController.userDetail)

// GET request for all users.
router.get('/users', userController.usersList)

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
router.get('/club', userController.club)

module.exports = router
