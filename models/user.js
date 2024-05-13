const mongoose = require('mongoose')
const Schema = mongoose.Schema

const UserSchema = new Schema({
  firstName: { type: String, required: true, minLength: 3, maxLength: 20 },
  lastName: { type: String, required: true, minLength: 3, maxLength: 20 },
  email: { type: String, required: true, unique: true },
  username: {
    type: String,
    required: true,
    unique: true,
    minLength: 3,
    maxLength: 20,
  },
  password: { type: String, required: true },
  isClubMember: { type: Boolean, required: true, default: false },
  messages: [{ type: Schema.Types.ObjectId, ref: 'Messages' }],
  dateOfBirth: { type: Date, default: null },
  profilePicUrl: { type: String, default: '' },
  bio: { type: String, maxLength: 255, default: '' },
})

UserSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`
})

UserSchema.virtual('url').get(function () {
  return `/dashboard/user/${this._id}`
})

UserSchema.virtual('dobFormatted').get(function () {
  const date = this.dateOfBirth
  const year = date.getFullYear()
  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ]
  const month = monthNames[date.getMonth()]
  const day = date.getDate()

  //  (Month DD, YYYY) April 03, 2000
  const formattedDate = `${month} ${day.toString().padStart(2, '0')}, ${year}`
  return formattedDate
})

UserSchema.virtual('dobForInput').get(function () {
  const date = this.dateOfBirth
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  // (YYYY-MM-DD) 2000-04-03
  const formattedDate = `${year}-${month}-${day}`
  return formattedDate
})

module.exports = mongoose.model('Users', UserSchema)
