const { unlink } = require('fs');
const HttpError = require('../models/httpError');
const multer = require('multer');

// Not found Handler
exports.notFoundHandler = (req, res, next) => {
  const error = new HttpError(404, 'Your requested content was not found!');
  return next(error);
};

// Common Error
exports.commonError = (error, req, res, next) => {
  if (req.file) {
    unlink(req.file.path, err => {
      if (err) throw err;
    });
  }
  if (error instanceof multer.MulterError) {
    res.status(500).json({ message: 'Uploading file failed!' });
  } else {
    res.status(error.code || 500).json({ message: error.message });
  }
};
