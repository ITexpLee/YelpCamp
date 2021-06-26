//Fetch mongoose 
const mongoose = require('mongoose');
const {Schema} = mongoose;

//Creating Schema
const reviewSchema = new Schema({
    body: {
        type: String
    },
    rating: {
        type: Number
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
});

//Create model 
module.exports = mongoose.model('Review', reviewSchema);;