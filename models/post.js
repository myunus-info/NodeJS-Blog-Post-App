const mongoose = require('mongoose');
const HttpError = require('./httpError');
const Schema = mongoose.Schema;

const postSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    creator: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

postSchema.statics.findPostByPostId = async function (postId) {
  let post;
  try {
    post = await this.findById(postId);
  } catch (err) {
    const error = new HttpError(500, 'Fetching post failed!');
    return next(error);
  }

  if (!post) {
    const error = new HttpError(404, 'Could not find post for provided Id!');
    return next(error);
  }
  return post;
};

module.exports = mongoose.model('Post', postSchema);
