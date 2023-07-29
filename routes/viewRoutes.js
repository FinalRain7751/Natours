const express = require('express');
const viewsController = require('../controllers/viewsController');
const authcontroller = require('../controllers/authController');
const bookingcontroller = require('../controllers/bookingController');

const router = express.Router();

// router.get('/', (req, res) => {
//   res.status(200).render('base', {
//     tour: 'The Forest Hiker',
//     user: 'Jonas',
//   });
// });

router.get(
  '/',
  bookingcontroller.createBookingCheckout,
  authcontroller.isLoggedIn,
  viewsController.getOverview,
);
router.get('/tour/:slug', authcontroller.isLoggedIn, viewsController.getTour);
router.get('/login', authcontroller.isLoggedIn, viewsController.getLoginForm);
router.get('/me', authcontroller.protect, viewsController.getAccount);
router.get('/my-tours', authcontroller.protect, viewsController.getMyTours);

router.post(
  '/submit-user-data',
  authcontroller.protect,
  viewsController.updateUserData,
);

module.exports = router;
