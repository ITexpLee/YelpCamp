//Require mongoose and other dependencies for model creation
const mongoose = require('mongoose');
//We do as we need to call schema multiple times
const Schema = mongoose.Schema;

//Creating our Campground Model
const campgroundSchema = new Schema({
    title: {
        type: String
    },
    price: {
        type: Number
    },
    description: {
        type: String
    },
    location: {
        type: String
    }
});

//Create the model using the Schema
//We use capital letter because it is similar to a class construtor
const Campground = mongoose.model('Campground', campgroundSchema);

//Now export the model so it can be used (Exported in form of an object)
module.exports = Campground;
