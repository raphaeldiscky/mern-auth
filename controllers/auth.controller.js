const User = require('../models/auth.model')
const expressJwt = require('express-jwt')
const _ = require('lodash')
const axios = require('axios')
const jwt = require('jsonwebtoken')
const sgMail = require('@sendgrid/mail')
const { OAuth2Client } = require('google-auth-library')
const { validationResult } = require('express-validator')

// custom error handler to get useful error from database errors
const { errorHandler } = require('../helpers/dbErrorHandling')

sgMail.setApiKey(process.env.MAIL_KEY)
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

    // email data sending
    const emailData = {
      from: process.env.EMAIL_FROM,
      to: to,
      subject: `Account activation link`,
      html: `
        <h1>Please Click to link to activate</h1>
        <p>${process.env.CLIENT_URL}/users/activate/${token}</p>
        <hr/>
        <p>This email contain sensitive info</p>
        <p>${process.env.CLIENT_URL}</p>
      `
    }
  }
}
