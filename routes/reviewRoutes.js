const express = require('express');
const router = express.Router({ mergeParams: true });
const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController');

// Protect all review routes
router.use(authController.protect);

router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(
    authController.restrictedTo('user'),
    reviewController.setTourUserIds,
    reviewController.createReview,
  );

router
  .route('/:id')
  .get(reviewController.getReview)
  .patch(
    authController.restrictedTo('user', 'admin'),
    reviewController.checkIfReviewWrittenByLoggedInUser,
    reviewController.updateReview,
  )
  .delete(
    authController.restrictedTo('user', 'admin'),
    reviewController.checkIfReviewWrittenByLoggedInUser,
    reviewController.deleteReview,
  );

module.exports = router;
