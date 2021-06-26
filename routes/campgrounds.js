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
router.get('/', catchAsync( campgrounds.index ));

//Create Route (form page)
router.get('/new', isLoggedIn, campgrounds.renderNewForm );

//Create Route (Submitted) (end point)
router.post('/', isLoggedIn, validateCampground, catchAsync( campgrounds.createCampground ));

//Show Route (Where we will show detailed information of specific campground)
router.get('/:id', catchAsync( campgrounds.showCampground ));

//Edit/Update Route (form Page)
router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync( campgrounds.renderEditForm ));

//Update Route (Patch/Put request)
router.put('/:id', isLoggedIn, isAuthor, validateCampground, catchAsync( campgrounds.updateCampground ));

//Delete Route
router.delete('/:id', isAuthor, catchAsync( campgrounds.deleteCampground ));

//Exporting the campground route file to app.js
module.exports = router;