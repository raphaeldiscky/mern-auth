const User = require('../models/auth.model')
const expressJwt = require('express-jwt')
const _ = require('lodash')
const axios = require('axios')
const jwt = require('jsonwebtoken')
const nodemailer = require('nodemailer')
const { OAuth2Client } = require('google-auth-library')
const { validationResult } = require('express-validator')

// custom error handler to get useful error from database errors
const { errorHandler } = require('../helpers/dbErrorHandling')

exports.registerController = (req, res) => {
  const { name, email, password } = req.body
  const errors = validationResult(req)

  // validation to req.body, we will create custom validation in seconds
  if (!errors.isEmpty()) {
    const firstError = errors.array().map((error) => error.msg[0])
    return res.status(422).json({
      error: firstError
    })
  } else {
    User.findOne({ email }).exec((err, user) => {
      if (user) {
        return res.status(400).json({
          error: 'Email is taken'
        })
      }
    })
    // generate token
    const token = jwt.sign(
      {
        name,
        email,
        password
      },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    )

    let transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: {
        user: 'lexie.ryan@ethereal.email',
        pass: 'Ch2YTBnVpk8MWEytU9'
      }
    })

    // email data sending
    let info = {
      from: `Fred Foo 👻 <${process.env.EMAIL_FROM}>`,
      to: `${email}`,
      subject: 'Account activation link ✔',
      text: 'Hello world?',
      html: `
        <h1>Please Click to link to activate</h1>
        <p>${process.env.CLIENT_URL}/users/activate/${token}</p>
        <hr/>
        <p>This email contain sensitive info</p>
        <p>${process.env.CLIENT_URL}</p>
    `
    }

    transporter.sendMail(info, (error, info) => {
      if (error) {
        return res.status(400).json({
          error: errorHandler(error)
        })
      } else {
        console.log('Message sent: %s', info.messageId)
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info))
        return res.json({
          message: `Email has been sent to ${email}`
        })
      }
    })
  }
}

//

// const emailData = {
//   from: process.env.EMAIL_FROM,
//   to: to,
//   subject: `Account activation link`,
//   html: `
//     <h1>Please Click to link to activate</h1>
//     <p>${process.env.CLIENT_URL}/users/activate/${token}</p>
//     <hr/>
//     <p>This email contain sensitive info</p>
//     <p>${process.env.CLIENT_URL}</p>
//   `
// }

// sgMail
//   .send(emailData)
//   .then((sent) => {
//     return res.json({
//       message: `Email has been sent to ${email}`
//     })
//   })
//   .catch((err) => {
//     return res.status(400).json({
//       error: errorHandler(err)
//     })
//   })
