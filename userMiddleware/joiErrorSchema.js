const Joi = require('joi');
const ExpressError = require('../utilities/expressError.js'); //Error related dependencies user + module

//Joi Schema for campgroundValidation middleware
//We are specifically sending module.exports.campgroundSchema so that we can send multiple schema with other names too
const campgroundSchema = Joi.object({
    campground: Joi.object({
        title: Joi.string().required(),
        price: Joi.number().required().min(0),
        image: Joi.string().required(),
        location: Joi.string().required(),
        description: Joi.string().required()
    }).required()
});

//Defining our own express error handling middleware with the help of Joi Schema 
module.exports.validateCampground = (req, res, next) => {
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

//Joi Schema for validateReview middleware
//We were specifically sending module.exports.reviewSchema so that we can send multiple schema with other names too
const reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().required().min(1).max(5),
        body: Joi.string().required()
    }).required()
});

//Defining our own express error handling middleware
//Creating out Joi Schema 
module.exports.validateReview = (req, res, next) => {
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