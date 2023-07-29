const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Tour = require('../../models/tourModel');
const User = require('../../models/userModel');
const Review = require('../../models/reviewModel');

dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE.replace(
  '<password>',
  process.env.DATABASE_PASSWORD,
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then((con) => {
    console.log('DB connection succesful');
  });

// Reading data from some file
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));
const reviews = JSON.parse(
  fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8'),
);

// Import data into database
const importData = async (tours, users, reviews) => {
  try {
    const allTours = tours.map((tour) => {
      delete tour.id;
      return tour;
    });

    const allUsers = users.map((user) => {
      delete user.id;
      return user;
    });
    const allReviews = reviews.map((review) => {
      delete review.id;
      return review;
    });

    await Tour.create(allTours);
    await User.create(allUsers, { validateBeforeSave: false });
    await Review.create(allReviews);

    console.log('Data successfully imported');
    process.exit();
  } catch (err) {
    console.log(err);
  }
};

// Delete existing data from database
const deleteData = async () => {
  try {
    await Tour.deleteMany();
    await User.deleteMany();
    await Review.deleteMany();

    console.log('Data successfully deleted');
    process.exit();
  } catch (err) {
    console.log(err);
  }
};

if (process.argv[2] === '--import') importData(tours, users, reviews);

if (process.argv[2] === '--delete') deleteData();

// console.log(process.argv);
