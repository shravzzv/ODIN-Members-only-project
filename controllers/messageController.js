const asyncHandler = require('express-async-handler')
const { body, validationResult, matchedData } = require('express-validator')
const Message = require('../models/message')
const multerUtils = require('../utils/multer.util')
const handleImage = require('../middlewares/handleImage.middleware')

// The dashboard home page
exports.index = asyncHandler(async (req, res) => {
  // Get a list of all the messages and filter for the message content based on whether the user is a club member or not

  // non-club members get to see only the message
  // club members get to see the message with the entire metadata

  const messages = []
  if (req.user.isClubMember) {
    messages.push(
      ...(await Message.find({}).populate('user', 'username profilePicUrl'))
    )
  } else {
    messages.push(...(await Message.find({}, 'message')))
  }

  res.render('dashboard/index', {
    title: 'Dashboard',
    messages,
    isClubMember: req.user.isClubMember,
    user: req.user,
  })
})

// Display create message form on GET.
exports.composeGet = (req, res) => {
  res.render('dashboard/messageForm', { title: 'Compose a message' })
}

// Handle message create on POST.
exports.composePost = [
  // uplaod cover image using multer
  multerUtils.upload.single('file'),
  handleImage,

  // validate and sanitize fields
  body('title')
    .trim()
    .isLength({ min: 3, max: 32 })
    .withMessage('Title should be 3-32 characters long.')
    .escape(),

  body('message')
    .trim()
    .isLength({ min: 3, max: 255 })
    .withMessage('Message should be 3-255 characters long.')
    .escape(),

  body('tags')
    .trim()
    .escape()
    .optional()
    .customSanitizer((value) =>
      value
        .split(',')
        .map((tag) => tag.trim())
        .filter((tag) => tag)
    ),

  // handle message creation
  asyncHandler(async (req, res) => {
    const errors = validationResult(req)
    const sanitizedData = matchedData(req, {
      onlyValidData: false,
      includeOptionals: true,
    })

    const message = new Message({
      title: sanitizedData.title,
      message: sanitizedData.message,
      user: req.user.id,
      coverImgUrl: req.uploadedUrl || '',
      tags: sanitizedData.tags,
    })

    if (errors.isEmpty() && !req.imageError) {
      await message.save()
      res.redirect('/dashboard')
    } else {
      const allErrors = errors.array()
      if (req.imageError)
        allErrors.push({ path: 'file', msg: req.imageError.message })

      res.render('dashboard/messageForm', {
        title: 'Error composing a message',
        message,
        errors: allErrors,
      })
    }
  }),
]

// Display delete message form on GET.
exports.messageDeleteGet = asyncHandler(async (req, res) => {
  const message = await Message.findById(req.params.id)
  if (!message) return res.redirect('/dashboard')

  res.render('dashboard/messageDelete', { message })
})

// Handle message delete on POST.
exports.messageDeletePost = asyncHandler(async (req, res) => {
  await Message.findByIdAndDelete(req.body.messageId)
  res.redirect('/dashboard')
})

// Display update message form on GET.
exports.messageUpdateGet = asyncHandler(async (req, res) => {
  const message = await Message.findById(req.params.id)
  if (!message) return res.redirect('/dashboard')

  res.render('dashboard/messageForm', {
    title: 'Update message',
    message,
  })
})

// Handle message update on POST.
exports.messageUpdatePost = [
  // uplaod cover image using multer
  multerUtils.upload.single('file'),
  handleImage,

  // validate and sanitize fields
  body('title')
    .trim()
    .isLength({ min: 3, max: 32 })
    .withMessage('Title should be 3-32 characters long.')
    .escape(),

  body('message')
    .trim()
    .isLength({ min: 3, max: 255 })
    .withMessage('Message should be 3-255 characters long.')
    .escape(),

  body('tags')
    .trim()
    .escape()
    .optional()
    .customSanitizer((value) =>
      value
        .split(',')
        .map((tag) => tag.trim())
        .filter((tag) => tag)
    ),

  // handle message creation
  asyncHandler(async (req, res) => {
    const errors = validationResult(req)
    const sanitizedData = matchedData(req, {
      onlyValidData: false,
      includeOptionals: true,
    })
    const currentMessage = await Message.findById(req.params.id)

    const updatedMessage = new Message({
      ...currentMessage._doc,
      ...sanitizedData,
      coverImgUrl: req.uploadedUrl || '',
    })

    if (errors.isEmpty() && !req.imageError) {
      await Message.findByIdAndUpdate(req.params.id, updatedMessage)
      res.redirect('/dashboard')
    } else {
      const allErrors = errors.array()
      if (req.imageError)
        allErrors.push({ path: 'file', msg: req.imageError.message })

      res.render('dashboard/messageForm', {
        title: 'Error updating a message',
        message: updatedMessage,
        errors: allErrors,
      })
    }
  }),
]
