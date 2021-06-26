//requiring express and other modules
const express = require('express');
const app = express();
const catchAsync = require('../utilities/catchAsync.js'); //The error wrapper or async wrapper


//Add express router in here
const router = express.Router({mergeParams: true});

//Developer created Model and dependencies required by route file
const Campground = require('../models/campground.js');
const Review = require('../models/review.js');

//reviewSchema for Joi validation
const { validateReview } = require('../userMiddleware/joiErrorSchema'); //It is created with Joi which is then used to validate
//Middleware to authenticate if any user has logged in
// Middleware to check if user has appropriate authority to perform action on a review
const { isLoggedIn, isReviewAuthor } = require('../userMiddleware/isAuthenticated.js');

//Create Route for Review after all camp Routes
router.post('/', isLoggedIn, validateReview, catchAsync(async (req, res, next) => {
    //Fetch our campground from DB
    const campground = await Campground.findById(req.params.id);
    //Create review instance
    const review = new Review(req.body.review);
    //Push/Add author or user into the review author property
    review.author = req.user._id;
    //push it into campground
    campground.reviews.push(review);
    //save both of them
    await review.save();
    await campground.save();
    // Flash for new review
    req.flash('success', 'Created new review!');
    res.redirect(`/campgrounds/${campground._id}`);
}));

//Delete Route for the Review
router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync( async(req, res, next) => {
    const {id, reviewId} = req.params;
    //first find the Campground to update
    //We use $pull operator which is a mongo operator which removes the matching instance
    await Campground.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});
    //find the review to delete
    await Review.findByIdAndDelete(reviewId);
    //flash for deleting the review
    req.flash('success', 'Successfully deleted review!');
    res.redirect(`/campgrounds/${id}`);
}));

module.exports = router;