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

//creating all routes

//Register Route (Start)
router.get('/register', (req, res) => {
    res.render('users/register.ejs');
});

//Register Route(End point)
router.post('/register', catchAsync(async (req, res, next) => {
    try {
        const {
            username,
            email,
            password
        } = req.body;
        const user = await new User({
            username: username,
            email: email
        });
        //registering user through passport (Inserting in database with hash password)
        const registeredUser = await User.register(user, password);
        //Call the method req.login to login registered user(passport method)
        req.login(registeredUser, err => {
            if (err) {
                return next(err);
            }
            //adding flash message for successful login
            req.flash('success', 'Welcome to Yelp Camp!');
            //redirecting on homepage
            res.redirect('/campgrounds');
        });
    } catch (e) {
        req.flash('error', e.message);
        //redirecting to register page again
        res.redirect('/register');
    }
}));

//login Route (Start)
router.get('/login', (req, res) => {
    res.render('users/login.ejs');
});

//login Route (End)
router.post('/login', passport.authenticate('local', {
    failureFlash: true,
    failureRedirect: '/login'
}), (req, res) => {
    req.flash('success', 'Welcome back');
    //Fetch user req object the url where user should be redirected
    const redirectUrl = req.session.returnTo || '/campgrounds';
    //delete the returnTo property from session object
    delete req.session.returnTo;
    res.redirect(redirectUrl);
});

//logout Route
router.get('/logout', (req, res) => {
    //We get this method with passport
    req.logout();
    req.flash('success', 'Goodbye!');
    res.redirect('/campgrounds');
});

module.exports = router;