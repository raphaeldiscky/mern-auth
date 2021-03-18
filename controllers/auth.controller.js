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

    const oAuth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT,
      process.env.GOOGLE_SECRET,
      process.env.GOOGLE_REDIRECT_URL
    )
    oAuth2Client.setCredentials({
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN
    })

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
              message: 'Signup Success'
              // user
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

exports.loginController = (req, res) => {
  const { email, password } = req.body
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    const firstError = errors.array().map((error) => error.msg)[0]
    return res.status(422).json({
      error: firstError
    })
  } else {
    // check if user exist
    User.findOne({
      email
    }).exec((err, user) => {
      if (err || !user) {
        return res.status(400).json({
          error: 'User with that email does not exist. Please Sign up'
        })
      }

      // authenticate
      if (!user.authenticate(password)) {
        return res.status(400).json({
          error: 'Email and password do not match'
        })
      }

      // generate token
      const token = jwt.sign(
        {
          _id: user._id
        },
        process.env.JWT_SECRET,
        {
          expiresIn: '7d'
        }
      )
      const { _id, name, email, role } = user
      return res.json({
        token,
        user: {
          _id,
          name,
          email,
          role
        }
      })
    })
  }
}

exports.forgetController = (req, res) => {
  const { email } = req.body
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    const firstError = errors.array().map((error) => error.msg)[0]
    return res.status(422).json({
      error: firstError
    })
  } else {
    User.findOne({ email }, (err, user) => {
      if (err || !user) {
        return res.status(400).json({
          error: 'User with that email does not exist'
        })
      }
      const token = jwt.sign(
        {
          _id: user._id
        },
        process.env.JWT_RESET_PASSWORD,
        {
          expiresIn: '10m'
        }
      )

      const oAuth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT,
        process.env.GOOGLE_SECRET,
        process.env.GOOGLE_REDIRECT_URL
      )
      oAuth2Client.setCredentials({
        refresh_token: process.env.GOOGLE_REFRESH_TOKEN
      })

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

      // send email with this token
      let info = {
        from: `Raphael Discky 👻 <${process.env.EMAIL_FROM}>`,
        to: `${email}`,
        subject: 'Password Reset Link',
        text: 'Password Reset Link',
        html: `
          <h1>Please Click to link to reset your password</h1>
          <p>${process.env.CLIENT_URL}/users/password/reset/${token}</p>
          <hr/>
          <p>This email contain sensitive info</p>
          <p>${process.env.CLIENT_URL}</p>
        `
      }

      return user.updateOne(
        {
          resetPasswordLink: token
        },
        (err, success) => {
          if (err) {
            return res.status(400).json({
              error: errorHandler(err)
            })
          } else {
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
      )
    })
  }
}

exports.resetController = (req, res) => {
  const { resetPasswordLink, newPassword } = req.body
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    const firstError = errors.array().map((error) => error.msg)[0]
    return res.status(422).json({
      error: firstError
    })
  } else {
    if (resetPasswordLink) {
      jwt.verify(
        resetPasswordLink,
        process.env.JWT_RESET_PASSWORD,
        function (err, decoded) {
          if (err) {
            return res.status(400).json({
              error: 'Expired link, try again'
            })
          }
          User.findOne({ resetPasswordLink }, (err, user) => {
            if (err || !user) {
              return res.status(400).json({
                error: 'Something went wrong, try later'
              })
            }

            const updatedFields = {
              password: newPassword,
              resetPasswordLink: ''
            }

            user = _.extend(user, updatedFields)
            user.save((err, result) => {
              if (err) {
                return res.status(400).json({
                  error: 'Error resetting user password'
                })
              } else {
                return res.json({
                  message: 'Great! Now you can login with new password'
                })
              }
            })
          })
        }
      )
    }
  }
}

const client = new OAuth2Client(process.env.GOOGLE_CLIENT)
exports.googleController = (req, res) => {
  const { idToken } = req.body
  // get token from request

  // verify token
  client
    .verifyIdToken({ idToken, audience: process.env.GOOGLE_CLIENT })
    .then((response) => {
      const { email_verified, name, email } = response.payload
      // check if email verified
      if (email_verified) {
        User.findOne({ email }).exec((err, user) => {
          // find if this email already exists
          if (user) {
            const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
              expiresIn: '7d'
            })
            const { _id, email, name, role } = user
            // send response to client side
            return res.json({
              token,
              user: { _id, email, name, role }
            })
          } else {
            // if user not exist, we will save in database and generate password for it
            let password = email + process.env.JWT_SECRET
            user = new User({ name, email, password }) // create user object with this email
            user.save((err, data) => {
              if (err) {
                return res.status(400).json({
                  error: errorHandler(err)
                })
              }
              // if no error, generate token
              const token = jwt.sign(
                { _id: data._id },
                process.env.JWT_SECRET,
                { expiresIn: '7d' }
              )
              const { _id, email, name, role } = data
              return res.json({
                token,
                user: { _id, email, name, role }
              })
            })
          }
        })
      } else {
        return res.status(400).json({
          error: 'Google login failed, try again'
        })
      }
    })
}

exports.facebookController = (req, res) => {
  const { userID, accessToken } = req.body
  const url = `https://graph.facebook.com/${userID}?fields=id,name&access_token=${accessToken}`

  // get data from facebook
  return axios(url, {
    method: 'GET'
  })
    .then((response) => {
      const { email, name } = response
      User.findOne({ email }).exec((err, user) => {
        if (user) {
          const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
            expiresIn: '7d'
          })
          const { _id, email, name, role } = user
          // send response to client side
          return res.json({
            token,
            user: { _id, email, name, role }
          })
        } else {
          let password = email + process.env.JWT_SECRET
          user = new User({ name, email, password })
          user.save((err, data) => {
            if (err) {
              return res.status(400).json({
                error: 'User sign in failed with Facebook'
              })
            }

            const token = jwt.sign({ _id: data._id }, process.env.JWT_SECRET, {
              expiresIn: '7d'
            })
            const { _id, email, name, role } = data
            return res.json({
              token,
              user: { _id, email, name, role }
            })
          })
        }
      })
    })
    .catch((error) => {
      res.json({ error: 'Facebook login failed, try again' })
    })
}
