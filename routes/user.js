const express = require('express');
const router = express.Router();
const {
  addUserValidator,
  userValidationHandler,
} = require('../middlewares/validators/userValidator');
const userController = require('../controllers/user');
const isAuth = require('../middlewares/isAuth');

router.post(
  '/signup',
  addUserValidator,
  userValidationHandler,
  userController.signup
);

router.post('/login', userController.login);

router.post('/logout', isAuth, userController.logout);

module.exports = router;
