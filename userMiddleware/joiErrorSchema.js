const Joi = require('joi');

//We are specifically sending module.exports.campgroundSchema so that we can send multiple schema with other names too

module.exports.campgroundSchema = Joi.object({
    campground: Joi.object({
        title: Joi.string().required(),
        price: Joi.number().required().min(0),
        location: Joi.string().required(),
        description: Joi.string().required()
    }).required()
});