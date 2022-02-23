const bcrypt = require('bcryptjs');
const User = require('../models/user');
const HttpError = require('../models/httpError');

exports.signup = async (req, res, next) => {
  const { name, email, password } = req.body;

  let existingUser;
  try {
    existingUser = await User.findOne({ email });
  } catch (err) {
    const error = new HttpError(500, 'Signup failed!');
    return next(error);
  }

  if (existingUser) {
    const error = new HttpError(422, 'Could not sign up. User already exists!');
    return next(error);
  }

  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(password, 12);
  } catch (err) {
    const error = new HttpError(500, 'Signup failed!');
    return next(error);
  }

  const newUser = new User({ name, email, password: hashedPassword });

  try {
    await newUser.save();
  } catch (err) {
    const error = new HttpError(500, 'Signing user failed!');
    return next(error);
  }

  try {
    const token = await newUser.generateAuthToken();
    res.status(201).json({ uerId: newUser._id, email, token });
  } catch (err) {
    const error = new HttpError(500, 'Could not sign up user. Pls try again!');
    return next(error);
  }
};

exports.login = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const user = await User.findByCredentials(email, password);
    const token = user.generateAuthToken();
    res.status(200).json({ userId: user._id, token });
  } catch (err) {
    const error = new HttpError(422, 'Something went wrong!');
    return next(error);
  }
};

exports.logout = async (req, res, next) => {
  delete req.userId;
  console.log('From Router: ', req.userId);
  res.status(200).json({ message: 'Success' });
};
