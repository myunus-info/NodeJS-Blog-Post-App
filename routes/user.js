const express = require('express');
const router = express.Router();
const {
  addUserValidator,
  userValidationHandler,
} = require('../middlewares/validators/userValidator');
const userController = require('../controllers/user');

router.post(
  '/signup',
  addUserValidator,
  userValidationHandler,
  userController.signup
);

router.post('/login', userController.login);

module.exports = router;
