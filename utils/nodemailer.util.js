const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.NODEMAILER_EMAIL,
    pass: process.env.NODEMAILER_PASSWORD,
  },
})

exports.sendMail = (receiver, secret) => {
  const htmlContent = `
  <!DOCTYPE html>
  <html>
    <head>
      <style>
        h2 { color: #333; }
        p { font-size: 14px; }
        strong { font-weight: bold; }
      </style>
    </head>
    <body>
      <h2>Reset your password</h2>
      <p>The secret to change your password is: <strong>${secret}</strong>.</p>
      <p>Copy and paste the 6 characters as they are. Don't share this with anyone.</p>
    </body>
  </html>
`

  const mailOptions = {
    from: process.env.NODEMAILER_EMAIL,
    to: receiver,
    subject: 'Reset your password',
    html: htmlContent,
  }

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error)
    } else {
      console.log('Email sent: ' + info.response)
    }
  })
}
