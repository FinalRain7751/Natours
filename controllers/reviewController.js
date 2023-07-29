const Review = require('../models/reviewModel');
const AppError = require('../utils/appError');
const factory = require('./handlerFactory');
const catchAsync = require('../utils/catchAsync');
// const APIFeatures = require('../utils/apiFeatures');

exports.setTourUserIds = (req, res, next) => {
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;
  next();
};

exports.checkIfReviewWrittenByLoggedInUser = catchAsync(
  async (req, res, next) => {
    const review = await Review.findById(req.params.id);
    if (review.user.id !== req.user.id) {
      return next(
        new AppError('A user can only edit / delete their own review(s).', 400),
      );
    }
    next();
  },
);

exports.getAllReviews = factory.getAll(Review);
exports.getReview = factory.getOne(Review);
exports.createReview = factory.createOne(Review);
exports.updateReview = factory.updateOne(Review, 'review', 'rating');
exports.deleteReview = factory.deleteOne(Review);
