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
  loginController,
  forgetController,
  resetController,
  googleController,
  facebookController
} = require('../controllers/auth.controller.js')

router.post('/register', validRegister, registerController)
router.post('/login', validLogin, loginController)
router.post('/activation', activationController)
router.put('/password/forget', forgetPasswordValidator, forgetController)
router.put('/password/reset', resetPasswordValidator, resetController)
router.post('/googlelogin', googleController)
router.post('/facebooklogin', facebookController)

module.exports = router
