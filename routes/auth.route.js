const express = require('express')
const router = express.Router()

// validation
const {
  validRegister,
  validLogin,
  forgotPasswordValidator,
  resetPasswordValidator
} = require('../helpers/validation')

// load controllers
const {
  registerController,
  activationController
} = require('../controllers/auth.controller.js')

router.post('/register', validRegister, registerController)
router.post('/activation', activationController)

module.exports = router
