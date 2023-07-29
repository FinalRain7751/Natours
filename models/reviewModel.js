const mongoose = require('mongoose');
const Tour = require('../models/tourModel');
const User = require('../models/userModel');
const AppError = require('../utils/appError');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review cannot be empty'],
    },
    rating: {
      type: Number,
      // required: [true, 'Kindly provide a rating'],
      min: [1, 'Rating must be between 1 and 5'],
      max: [5, 'Rating must be between 1 and 5'],
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'A review must belong to a tour.'],
    },

    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: ['true', 'A review must have an author.'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Implementing unique reviews for each user-tour combination
// Jonas' implementation
// reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

// My implementation
reviewSchema.pre('save', async function (next) {
  try {
    const [reviewWithSameTourIdAndUserId] = await this.constructor.find({
      tour: this.tour,
      user: this.user,
    });
    if (reviewWithSameTourIdAndUserId) {
      next(new AppError('One user can give only one review about a tour', 400));
    }
    next();
  } catch (err) {
    next(new AppError('Error while saving review. Please try again.', 500));
  }
});

reviewSchema.pre(/^find/, async function (next) {
  //   this.populate({ path: 'user', select: 'name photo' }).populate({
  //     path: 'tour',
  //     select: 'name ratingsAverage',
  //   });
  this.populate({ path: 'user', select: 'name photo' });
  next();
});

reviewSchema.pre(/^find/, async function (next) {
  this.select('-__v');
  next();
});

// Static methods
reviewSchema.statics.calcAverageRatings = async function (tourId) {
  const stats = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);

  const ratingsAverage = stats.length > 0 ? stats[0].avgRating : 4.5;
  const ratingsQuantity = stats.length > 0 ? stats[0].nRating : 0;

  await Tour.findByIdAndUpdate(
    tourId,
    { ratingsAverage, ratingsQuantity },
    {
      new: true,
      runValidators: false,
    },
  );
};

// For dynamically updating ratings data in tours //
// While creating a new review
reviewSchema.post('save', async function () {
  // 'this' points to current review
  await this.constructor.calcAverageRatings(this.tour);
});

// While updating or deleting a review
reviewSchema.post(/^findOneAnd/, async function (docs, next) {
  await docs.constructor.calcAverageRatings(docs.tour);
  next();
});

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
