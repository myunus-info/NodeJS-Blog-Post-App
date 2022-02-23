const jwt = require('jsonwebtoken');
const HttpError = require('../models/httpError');

module.exports = (req, res, next) => {
  if (req.method === 'OPTIONS') {
    return next();
  }

  try {
    const token = req.headers.authorization.split(' ')[1];
    if (!token) {
      throw new Error('Please Authenticate!');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    const error = new HttpError(403, 'Authentication failed!');
    return next(error);
  }
};
