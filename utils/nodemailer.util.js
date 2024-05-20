const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.NODEMAILER_EMAIL,
    pass: process.env.NODEMAILER_PASSWORD,
  },
})

exports.sendMail = (receiver, secret) => {
  const mailOptions = {
    from: process.env.NODEMAILER_EMAIL,
    to: receiver,
    subject: 'Reset your password',
    text: `The secret to change your password is : "${secret}". Copy and paste the entire string between "" excluding the "".`,
  }

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error)
    } else {
      console.log('Email sent: ' + info.response)
    }
  })
}
