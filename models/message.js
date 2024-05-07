const mongoose = require('mongoose')
const Schema = mongoose.Schema

const MessageSchema = new Schema(
  {
    title: { type: String, required: true, minLength: 3, maxLength: 20 },
    message: { type: String, required: true, minLength: 3, maxLength: 255 },
    user: { type: Schema.Types.ObjectId, ref: 'Users', required: true },
    tags: { type: [String] },
    likes: [{ type: Schema.Types.ObjectId, ref: 'Users' }],
    coverImgUrl: { type: String },
  },
  {
    timestamps: true, // mongoose automatically adds createdAt & updatedAt fields
  }
)

MessageSchema.virtual('url').get(function () {
  return `/dashboard/message/${this._id}`
})

module.exports = mongoose.model('Messages', MessageSchema)
