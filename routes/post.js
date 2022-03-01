const express = require('express');
const router = express.Router();
const isAuth = require('../middlewares/isAuth');
const fileUpload = require('../middlewares/fileUpload');
const {
  isPostValid,
  handlePostValidation,
} = require('../middlewares/validators/postValidator');

const postController = require('../controllers/post');

router.post(
  '/post',
  isAuth,
  fileUpload.single('image'),
  isPostValid,
  handlePostValidation,
  postController.createPost
);

router.get('/posts', isAuth, postController.getPosts);

router.get('/post/:postId', isAuth, postController.getPostById);

router.get('/posts/:userId', isAuth, postController.getByUserId);

router.patch(
  '/post/:postId',
  isAuth,
  isPostValid,
  handlePostValidation,
  postController.updatePost
);

router.delete('/post/:postId', isAuth, postController.deletePost);

module.exports = router;
