//requiring express and other modules
const express = require('express');
const app = express();
const catchAsync = require('../utilities/catchAsync.js'); //The error wrapper or async wrapper
const ExpressError = require('../utilities/expressError.js'); //Error related dependencies user + module

//Add express router in here
const router = express.Router({mergeParams: true});

//Developer created Model and dependencies required by route file
const Campground = require('../models/campground.js');
const Review = require('../models/review.js');

//reviewSchema for Joi validation
const { reviewSchema } = require('../userMiddleware/joiErrorSchema'); //It is created with Joi which is then used to validate


//Defining our own express error handling middleware
//Creating out Joi Schema 
const validateReview = (req, res, next) => {
    //Once schema is defined we validate it by using validate method on the schema and passing req.body 
    // or whatever you want to validate in it
    const {
        error
    } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        //Otherwise even if there isn't an error it won't be passed to the route
        next();
    }
}

//Create Route for Review after all camp Routes
router.post('/', validateReview, catchAsync(async (req, res, next) => {
    //Fetch our campground from DB
    const campground = await Campground.findById(req.params.id);
    //Create review instance
    const review = new Review(req.body.review);
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
router.delete('/:reviewId', catchAsync( async(req, res, next) => {
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