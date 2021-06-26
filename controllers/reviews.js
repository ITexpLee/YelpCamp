//Model related to the Route
const Campground = require('../models/campground.js');
const Review = require('../models/review.js');

//Logic of ROUTES of Reviews

//Create Route
module.exports.createReview = async (req, res) => {
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
}

//Delete Route
module.exports.deleteReview = async(req, res, next) => {
    const {id, reviewId} = req.params;
    //first find the Campground to update
    //We use $pull operator which is a mongo operator which removes the matching instance
    await Campground.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});
    //find the review to delete
    await Review.findByIdAndDelete(reviewId);
    //flash for deleting the review
    req.flash('success', 'Successfully deleted review!');
    res.redirect(`/campgrounds/${id}`);
}