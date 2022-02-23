const { check, validationResult } = require('express-validator');
const HttpError = require('../../models/httpError');

const isPostValid = [
  check('title').trim().not().isEmpty(),
  check('description').trim().not().isEmpty().isLength({ min: 5 }),
];

const handlePostValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new HttpError(422, errors.mapped().image.msg);
    return next(error);
  }
  next();
};

module.exports = {
  isPostValid,
  handlePostValidation,
};
