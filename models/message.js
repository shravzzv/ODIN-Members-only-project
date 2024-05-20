const mongoose = require('mongoose')
const Schema = mongoose.Schema

const MessageSchema = new Schema(
  {
    title: { type: String, required: true, minLength: 3, maxLength: 32 },
    message: { type: String, required: true, minLength: 3, maxLength: 255 },
    user: { type: Schema.Types.ObjectId, ref: 'Users', required: true },
    tags: { type: [String] },
    coverImgUrl: { type: String },
  },
  {
    timestamps: true, // mongoose automatically adds createdAt & updatedAt fields
  }
)

MessageSchema.virtual('url').get(function () {
  return `/dashboard/message/${this._id}`
})

// I'm using updatedAt instead of createdAt because when the document is created, updatedAt is equal to the createdAt. So you can simply show 'x time ago' using this.
// showing now (<1 min), minutes ago, hours ago, days ago, weeks ago, months ago and years ago
MessageSchema.virtual('updatedAtFormatted').get(function () {
  const date = this.updatedAt
  const now = new Date()
  const diff = now - date

  // Extract units
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  const weeks = Math.floor(days / 7)

  // Format the string based on the difference
  if (seconds < 60) {
    return 'now'
  } else if (minutes < 60) {
    return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`
  } else if (hours < 24) {
    return `${hours} hour${hours !== 1 ? 's' : ''} ago`
  } else if (days < 7) {
    return `${days} day${days !== 1 ? 's' : ''} ago`
  } else {
    return `${weeks} week${weeks !== 1 ? 's' : ''} ago`
  }
})

module.exports = mongoose.model('Messages', MessageSchema)
