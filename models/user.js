const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const HttpError = require('./httpError');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    default: 'I am new',
  },
  posts: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Post',
    },
  ],
});

userSchema.statics = {
  findByCredentials: async function (email, password) {
    let existingUser;
    try {
      existingUser = await this.findOne({ email });
    } catch (err) {
      const error = new HttpError(500, 'Could not log in!');
      return next(error);
    }

    if (!existingUser) {
      const error = new HttpError(401, 'Invalid credentials!');
      return next(error);
    }

    let isMatch;
    try {
      isMatch = await bcrypt.compare(password, existingUser.password);
    } catch (err) {
      const error = new HttpError(500, 'Logging in failed!');
      return next(error);
    }

    if (!isMatch) {
      const error = new HttpError(422, 'Invalid credentials!');
      return next(error);
    }

    return existingUser;
  },

  findUserByUserId: async function (userId) {
    let user;
    try {
      user = await this.findById(userId);
    } catch (err) {
      const error = new HttpError(500, 'Fetching user failed!');
      return next(error);
    }

    if (!user) {
      const error = new HttpError(404, 'Could not find user for provided Id!');
      return next(error);
    }
    return user;
  },
};

userSchema.methods.generateAuthToken = function () {
  let token;
  try {
    token = jwt.sign(
      { userId: this._id, email: this.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
  } catch (err) {
    const error = new HttpError(500, 'Signing up user failed!');
    return next(error);
  }

  return token;
};

module.exports = mongoose.model('User', userSchema);
