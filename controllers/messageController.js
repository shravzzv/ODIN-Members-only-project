const asyncHandler = require('express-async-handler')
const { body, validateRequest } = require('express-validator')
const User = require('../models/user')
const Message = require('../models/message')
const multerUtils = require('../utils/multer.util')
const handleImage = require('../middlewares/handleImage.middleware')

// The dashboard home page
exports.index = asyncHandler(async (req, res, next) => {
  // Get a list of all the messages and filter for the message content based on whether the user is a club member or not
  // non-club members get to see only the message
  // club members get to see the message with the entire metadata

  // const messages = await Message.find()

  res.render('dashboard/index', { title: 'Dashboard', messages: [] })
})

exports.composeGet = (req, res, next) => {
  res.render('dashboard/messageForm', { title: 'Compose a message' })
}

exports.composePost = [
  // uplaod cover image using multer

  // validate and sanitize fields

  // handle message creation
  asyncHandler(async (req, res, next) => {
    res.send('composePOST not implemented.')
  }),
]

exports.messageDeleteGet = asyncHandler(async (req, res, next) => {
  res.send('MessageDeleteGet not implemented.')
})

exports.messageDeletePost = asyncHandler(async (req, res, next) => {
  res.send('MessageDeletePost not implemented.')
})

exports.messageUpdateGet = asyncHandler(async (req, res, next) => {
  res.send('MessageUpdateGet not implemented.')
})

exports.messageUpdatePost = asyncHandler(async (req, res, next) => {
  res.send('MessageUpdatePost not implemented.')
})

exports.messageDetailGet = asyncHandler(async (req, res, next) => {
  res.send('MessageDetailGet not implemented.')
})
