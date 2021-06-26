//requiring Express
const express = require('express');
const app = express();
const catchAsync = require('../utilities/catchAsync.js'); //The error wrapper or async wrapper

//Add express router in here
const router = express.Router({mergeParams: true});

//Model related to the Route
const Campground = require('../models/campground.js');

//Defining our own express error handling middleware
const { validateCampground } = require('../userMiddleware/joiErrorSchema.js');
 //To check if the author of campground is same as user logged in
 //Middleware to authenticate is logged in
const { isLoggedIn, isAuthor } = require('../userMiddleware/isAuthenticated.js'); 

//All the campground routes
//Index Route (Where all campgrounds are shown)
router.get('/', catchAsync(async (req, res, next) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index.ejs', {
        campgrounds: campgrounds
    });
}));

//Create Route (form page)
router.get('/new', isLoggedIn, (req, res) => {
    res.render('campgrounds/new.ejs');
});

//Create Route (Submitted) (end point)
router.post('/', isLoggedIn, validateCampground, catchAsync(async (req, res, next) => {
    //fetch all campground information and create an instance
    const campground = new Campground(req.body.campground);
    //add author or user to the instace
    campground.author = req.user._id
    await campground.save();
    //Adding flash message to req
    req.flash('success', 'Successfully made a new campground');
    res.redirect(`/campgrounds/${campground._id}`);
}));

//Show Route (Where we will show detailed information of specific campground)
router.get('/:id', catchAsync(async (req, res, next) => {
    const {
        id
    } = req.params;
    const campground = await Campground.findById(id).populate('reviews').populate('author');
    //if campground was deleted or not found (url tampering)
    if(!campground) {
        //flash a message and redirect to the index page rather than individual campground
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show.ejs', {
        campground: campground
    });
}));

//Edit/Update Route (form Page)
router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(async (req, res, next) => {
    const campground = await Campground.findById(req.params.id);
    //if campground was deleted or not found (url tampering)
    if(!campground) {
        //flash a message and redirect to the index page rather than individual campground
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit.ejs', {
        campground: campground
    });
}));

//Update Route (Patch/Put request)
router.put('/:id', isLoggedIn, isAuthor, validateCampground, catchAsync(async (req, res, next) => {
    //Update the following campground
    //Here we get id from first and the second returns us the value of campground object
    const campground = await Campground.findByIdAndUpdate(req.params.id, {
        ...req.body.campground
    }, {
        new: true,
        useFindAndModify: false
    });
    // Flash message on updating campground
    req.flash('success', 'Successfully updated campground!');
    res.redirect(`/campgrounds/${campground._id}`)
}));

//Delete Route
router.delete('/:id', isAuthor, catchAsync(async (req, res, next) => {
    //Delete the following campground
    await Campground.findByIdAndDelete(req.params.id);
    req.flash('success', 'Successfully deleted campground!');
    res.redirect(`/campgrounds`);
}));

//Exporting the campground route file to app.js
module.exports = router;