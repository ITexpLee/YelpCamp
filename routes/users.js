//require express and other dependencies
const express = require('express');
const app = express();
const catchAsync = require('../utilities/catchAsync.js'); //The error wrapper or async wrapper
const ExpressError = require('../utilities/expressError.js'); //Error related dependencies user + module
const passport = require('passport');

//Express Router in here
const router = express.Router();

//requiring models related to the router
const User = require('../models/user.js');

// User controller modules (Here users is the main object with all routes as properties)
const users = require('../controllers/users.js');

//creating all routes

//Register Route (Start)
router.get('/register', users.renderRegister );

//Register Route(End point)
router.post('/register', catchAsync( users.Register ));

//login Route (Start)
router.get('/login', users.renderLogin );

//login Route (End)
router.post('/login', passport.authenticate('local', {
    failureFlash: true,
    failureRedirect: '/login'
}), users.login );

//logout Route (Destroy Route)
router.get('/logout', users.logout );

module.exports = router;