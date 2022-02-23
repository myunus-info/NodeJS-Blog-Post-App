const mongoose = require('mongoose');
const User = require('../models/user');
const Post = require('../models/post');
const HttpError = require('../models/httpError');
const { unlink } = require('fs');

exports.createPost = async (req, res, next) => {
  const { title, description } = req.body;
  const image = req.file.path.replace('\\', '/');
  const post = new Post({ title, image, description, creator: req.userId });
  try {
    const user = await User.findUserByUserId(req.userId);
    const session = await mongoose.startSession();
    session.startTransaction();
    await post.save({ session });
    user.posts.push(post);
    await user.save({ session });
    await session.commitTransaction();
  } catch (err) {
    const error = new HttpError(500, 'Creating post failed!');
    return next(error);
  }

  res.status(201).json({ message: 'Post created!', post });
};

exports.getPosts = async (req, res, next) => {
  let currPage = req.query.page || 1;
  const perPage = 2;
  try {
    const totalItems = await Post.countDocuments();
    const posts = await Post.find({}, '-creator')
      .populate('creator')
      .skip((currPage - 1) * perPage)
      .limit(perPage);

    res.status(200).json({ message: 'Posts fetched!', posts, totalItems });
  } catch (err) {
    const error = new HttpError(500, 'Fetching posts failed!');
    return next(error);
  }
};

exports.getPostById = async (req, res, next) => {
  try {
    const post = await Post.findPostByPostId(req.params.postId);
    res.status(200).json({ message: 'Post fetched successflly!', post });
  } catch (err) {
    const error = new HttpError(422, 'Something went wrong!');
    return next(error);
  }
};

exports.getByUserId = async (req, res, next) => {
  let userWithPosts;
  try {
    userWithPosts = await User.findById(req.params.userId).populate('posts');
  } catch (err) {
    const error = new HttpError(500, 'Fetching posts failed!');
    return next(error);
  }

  if (!userWithPosts || userWithPosts.posts.length === 0) {
    const error = new HttpError(404, 'Could not find posts for provided Id!');
    return next(error);
  }
  res.status(200).json({ posts: userWithPosts.posts.map(posts => posts) });
};

exports.updatePost = async (req, res, next) => {
  const { title, description } = req.body;

  let post;
  try {
    post = await Post.findPostByPostId(req.params.postId);
  } catch (err) {
    const error = new HttpError(422, 'Something went wrong!');
    return next(error);
  }

  // Authorization check
  if (post.creator.toString() !== req.userId) {
    const error = new HttpError(403, 'Your are not allowed to edit this post!');
    return next(error);
  }
  //

  (post.title = title), (post.description = description);

  try {
    await post.save();
  } catch (err) {
    const error = new HttpError(500, 'Updating post failed!');
    return next(error);
  }

  res.status(200).json({ message: 'Post updated successfully!', post });
};

exports.deletePost = async (req, res, next) => {
  let post;
  try {
    post = await Post.findPostByPostId(req.params.postId);
  } catch (err) {
    const error = new HttpError(422, 'Something went wrong!');
    return next(error);
  }

  //   Authorization check
  if (post.creator.toString() !== req.userId) {
    const error = new HttpError(403, 'You are not allowed to delete post!');
    return next(error);
  }
  //

  try {
    const user = await User.findUserByUserId(req.userId);
    const session = await mongoose.startSession();
    session.startTransaction();
    await post.remove({ session });
    user.posts.pull(post);
    await user.save({ session });
    await session.commitTransaction();
  } catch (err) {
    const error = new HttpError(500, 'Deleting post failed!');
    return next(error);
  }

  const imagePath = post.image;
  unlink(imagePath, err => {
    if (err) throw err;
  });

  res.status(200).json({ message: 'Post deleted!' });
};
