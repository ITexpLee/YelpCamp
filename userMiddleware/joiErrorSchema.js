const BaseJoi = require('joi');
const ExpressError = require('../utilities/expressError.js'); //Error related dependencies user + module

//New joi extention
const sanitizeHtml = require('sanitize-html');

//Our own Joi extention names escape HTMl for safety from cross site scirpts
const extension = (joi) => ({
    type: 'string',
    base: joi.string(),
    messages: {
        'string.escapeHTML': '{{#label}} must not include HTML!'
    },
    rules: {
        escapeHTML: {
            validate(value, helpers) {
                const clean = sanitizeHtml(value, {
                    allowedTags: [],
                    allowedAttributes: {},
                });
                if (clean !== value) return helpers.error('string.escapeHTML', {
                    value
                })
                return clean;
            }
        }
    }
});
//Extending our normal joi to base joi with extention
const Joi = BaseJoi.extend(extension);

//Joi Schema for campgroundValidation middleware
//We are specifically sending module.exports.campgroundSchema so that we can send multiple schema with other names too
const campgroundSchema = Joi.object({
    campground: Joi.object({
        title: Joi.string().required().escapeHTML(),
        price: Joi.number().required().min(0),
        // image: Joi.string().required(),
        location: Joi.string().required().escapeHTML(),
        description: Joi.string().required().escapeHTML()
    }).required(),
    //It is not required as it won't be passed everytime we submit only on edit (where also it can be empty)
    deleteImages: Joi.array()
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
        body: Joi.string().required().escapeHTML()
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