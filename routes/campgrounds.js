//requiring Express
const express = require('express');
const app = express();
const catchAsync = require('../utilities/catchAsync.js'); //The error wrapper or async wrapper
const ExpressError = require('../utilities/expressError.js'); //Error related dependencies user + module

//Add express router in here
const router = express.Router({mergeParams: true});

//Model related to the Route
const Campground = require('../models/campground.js');

//campgroundSchema for Joi validation
const {campgroundSchema} = require('../userMiddleware/joiErrorSchema');
const {isLoggedIn} = require('../userMiddleware/isAuthenticated.js'); //Middleware to authenticate is logged in

//Defining our own express error handling middleware
//Creating out Joi Schema 
const validateCampground = (req, res, next) => {
    //Once schema is defined we validate it by using validate method on the schema and passing req.body 
    // or whatever you want to validate in it
    const {
        error
    } = campgroundSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        //Otherwise even if there isn't an error it won't be passed to the route
        next();
    }
}


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
    const campground = new Campground(req.body.campground);
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
router.get('/:id/edit', isLoggedIn, catchAsync(async (req, res, next) => {
    //fetch data of campground to be edited
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
router.put('/:id', isLoggedIn, validateCampground, catchAsync(async (req, res, next) => {
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
router.delete('/:id', catchAsync(async (req, res, next) => {
    //Delete the following campground
    await Campground.findByIdAndDelete(req.params.id);
    req.flash('success', 'Successfully deleted campground!');
    res.redirect(`/campgrounds`);
}));

//Exporting the campground route file to app.js
module.exports = router;