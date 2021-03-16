const express = require('express')
const router = express.Router()

// validation
const {
  validRegister,
  validLogin,
  forgetPasswordValidator,
  resetPasswordValidator
} = require('../helpers/validation')

// load controllers
const {
  registerController,
  activationController,
  loginController
} = require('../controllers/auth.controller.js')

router.post('/register', validRegister, registerController)
router.post('/login', validLogin, loginController)
router.post('/activation', activationController)
router.post('/password/forget', forgetPasswordValidator, forgetController)

module.exports = router
