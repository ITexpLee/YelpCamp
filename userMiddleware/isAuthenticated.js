//Dependencies required
const Campground = require('../models/campground.js'); //campground Model
const Review = require('../models/review.js');

//Check if user has loggedIn or not
//When we need to transfer method we use this syntax
module.exports.isLoggedIn = (req, res, next) => {
    if(!req.isAuthenticated()){
        //if not logged in we add url of user location 
        req.session.returnTo = req.originalUrl;
        req.flash('error', 'you must be signed in first!');
        return res.redirect('/login');
    }
    next();
}

//Creating our own middleware to check if the user is allowed to edit camp or not
module.exports.isAuthor = async (req, res, next) => {
    //fetch the id from route (id of campground)
    const { id } = req.params;
    //fetch the campground from db
    const campground = await Campground.findById(id);
    //if the campground author and loggedin user is not same
    if(!campground.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that!');
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}

//Creating our own middleware to check if the user is allowed to edit camp or not
module.exports.isReviewAuthor = async (req, res, next) => {
    //fetch the reviewId from route (id of review)
    const { id, reviewId } = req.params;
    //fetch the review from db
    const review = await Review.findById(reviewId);
    //if the Review author and loggedin user is not same
    if(!review.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that!');
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}
