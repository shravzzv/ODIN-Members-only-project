const fs = require('fs')
const cloudinaryUtils = require('../utils/cloudinary.util')

/**
 * This middleware handles a single image upload using Multer and Cloudinary. It checks for an uploaded file, validates it's an image, and then uploads it to Cloudinary. If a previous profile picture URL exists, it deletes the old image before uploading the new one.  
 * If successful, the uploaded image URL is stored on `req.uploadedUrl`. If the file to upload isn't an image, an error object is placed on `req.imageError` for further handling.
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 * @param {NextFunction} next - The next function in the middleware chain.

 */
const handleImage = async (req, res, next) => {
  // Use existing picture URLs from the request body if available; the name in the hidden input must be imgUrl
  if (req.body.imgUrl) req.uploadedUrl = req.body.imgUrl

  if (req.file) {
    if (!req.file.mimetype.startsWith('image/')) {
      req.imageError = new Error('Please upload an image file.')
    } else {
      if (req.body.imgUrl)
        await cloudinaryUtils.deleteUploadedFile(req.body.imgUrl)

      req.uploadedUrl = await cloudinaryUtils.getUploadedUrl(req.file.path)
    }
    fs.unlink(req.file.path, (err) => err && console.log(err))
    next()
  } else next()
}

module.exports = handleImage
