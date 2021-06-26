//Require mongoose and other dependencies for model creation
const mongoose = require('mongoose');
//We do as we need to call schema multiple times
const Schema = mongoose.Schema;
//Require review model in order to delete
const Review = require('./review.js');

//Creating our Campground Model
const campgroundSchema = new Schema({
    title: {
        type: String
    },
    image: {
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
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [{
        type: Schema.Types.ObjectId,
        ref: 'Review'
    }]
});

//Adding mongoose middleware in order to delete all related reviews to the campground  
//Here document means our deleted campground (with all it's properties name, image, price as well as reviews array)
campgroundSchema.post('findOneAndDelete', async function(doc) {
    if(doc){
        //Here we say that delete all review in Review collection where id is in doc.reviews array
        // (basically all reviews whose id in campground reviews array)
        await Review.deleteMany({
            _id: {
                $in: doc.reviews
            }
        })
    }
})

//Create the model using the Schema
//We use capital letter because it is similar to a class construtor
const Campground = mongoose.model('Campground', campgroundSchema);  

//Now export the model so it can be used (Exported in form of an object)
module.exports = Campground;
