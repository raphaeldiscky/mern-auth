const User = require('../models/auth.model')
const expressJwt = require('express-jwt')
const _ = require('lodash')
const axios = require('axios')
const jwt = require('jsonwebtoken')
const nodemailer = require('nodemailer')
const { OAuth2Client } = require('google-auth-library')
const { validationResult } = require('express-validator')
const { google } = require('googleapis')

// custom error handler to get useful error from database errors
const { errorHandler } = require('../helpers/dbErrorHandling')

exports.registerController = (req, res) => {
  const { name, email, password } = req.body
  const errors = validationResult(req)

  const oAuth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT,
    process.env.GOOGLE_SECRET,
    process.env.GOOGLE_REDIRECT_URL
  )
  oAuth2Client.setCredentials({
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN
  })

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
      process.env.JWT_ACCOUNT_ACTIVATION,
      { expiresIn: '15m' }
    )

    const accessToken = oAuth2Client.getAccessToken()

    let transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: 'zundria.putra@gmail.com',
        clientId: process.env.GOOGLE_CLIENT,
        clientSecret: process.env.GOOGLE_SECRET,
        refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
        accessToken: accessToken
      }
    })

    // email data sending
    let info = {
      from: `Raphael Discky 👻 <${process.env.EMAIL_FROM}>`,
      to: `${email}`,
      subject: 'Account Activation Link',
      text: 'Account Activation Link',
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
        return res.json({
          message: `Email has been sent to ${email}`
        })
      }
    })
  }
}

// Activation and save to database
exports.activationController = (req, res) => {
  const { token } = req.body

  if (token) {
    jwt.verify(token, process.env.JWT_ACCOUNT_ACTIVATION, (err, decoded) => {
      if (err) {
        return res.status(401).json({
          errors: 'Expired token. Signup again'
        })
      } else {
        const { name, email, password } = jwt.decode(token)

        const user = new User({
          name,
          email,
          password
        })

        user.save((err, user) => {
          if (err) {
            return res.status(401).json({
              errors: errorHandler(err)
            })
          } else {
            return res.json({
              success: true,
              message: 'Signup Success',
              user
            })
          }
        })
      }
    })
  } else {
    return res.json({
      message: 'Error happening please try again'
    })
  }
}
