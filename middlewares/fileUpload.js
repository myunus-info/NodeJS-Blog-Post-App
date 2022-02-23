const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const HttpError = require('../models/httpError');

const MIME_TYPE_MAP = {
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/jpeg': 'jpeg',
};
const fileUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'images');
    },
    filename: (req, file, cb) => {
      cb(null, `${uuidv4()}.${MIME_TYPE_MAP[file.mimetype]}`);
    },
  }),
  limits: {
    fileSize: 1000000,
  },
  fileFilter: (req, file, cb) => {
    const isValid = !!MIME_TYPE_MAP[file.mimetype];
    const error = isValid ? null : new HttpError('422', 'Invalid mimetype!');
    cb(error, isValid);
  },
});

module.exports = fileUpload;
