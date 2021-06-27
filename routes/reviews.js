//requiring express and other modules
const express = require('express');
const app = express();
const catchAsync = require('../utilities/catchAsync.js'); //The error wrapper or async wrapper

//Add express router in here
const router = express.Router({mergeParams: true});

// Review controller modules (Here reviews is the main object with all routes as properties)
const reviews = require('../controllers/reviews.js');

//reviewSchema for Joi validation
const { validateReview } = require('../userMiddleware/joiErrorSchema'); //It is created with Joi which is then used to validate
//Middleware to authenticate if any user has logged in
// Middleware to check if user has appropriate authority to perform action on a review
const { isLoggedIn, isReviewAuthor } = require('../userMiddleware/isAuthenticated.js');

//Create Route for Review after all camp Routes
router.post('/', isLoggedIn, validateReview, catchAsync( reviews.createReview ));

//Delete Route for the Review
router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync( reviews.deleteReview ));

module.exports = router;