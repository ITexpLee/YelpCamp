//requiring Express
const express = require('express');
const app = express();
const catchAsync = require('../utilities/catchAsync.js'); //The error wrapper or async wrapper

//Add express router in here
const router = express.Router({mergeParams: true});

// Campground controller modules (Here campgrounds is the main object with all routes as properties)
const campgrounds = require('../controllers/campgrounds.js');

//Model related to the Route
const Campground = require('../models/campground.js');

//Defining our own express error handling middleware
const { validateCampground } = require('../userMiddleware/joiErrorSchema.js');
 //To check if the author of campground is same as user logged in
 //Middleware to authenticate is logged in
const { isLoggedIn, isAuthor } = require('../userMiddleware/isAuthenticated.js'); 

//All the campground routes
//Index Route (Where all campgrounds are shown)
//Create Route (Submitted) (end point)
router.route('/')
    .get(catchAsync( campgrounds.index ))
    .post(isLoggedIn, validateCampground, catchAsync( campgrounds.createCampground ));

//Create Route (form page)
router.get('/new', isLoggedIn, campgrounds.renderNewForm );

//Show Route (Where we will show detailed information of specific campground)
//Update Route (Patch/Put request)
//Delete Route
router.route('/:id')
.get(catchAsync( campgrounds.showCampground ))
.put(isLoggedIn, isAuthor, validateCampground, catchAsync( campgrounds.updateCampground ))
.delete(isAuthor, catchAsync( campgrounds.deleteCampground ))

//Edit/Update Route (form Page)
router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync( campgrounds.renderEditForm ));

//Exporting the campground route file to app.js
module.exports = router;