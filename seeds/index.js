//Require all the important dependencies at the top
const express = require('express');
const app = express();
const path = require('path');

//Developer created Model and dependencies
const Campground = require('./../models/campground.js');
const cities = require('./cities.js');
const {
    descriptors,
    places
} = require('./seedHelpers.js');

//Connecting to mongoose and mongoDB
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
})
//Create a db variable as we will be calling the connection multiple times
const db = mongoose.connection;
db.then(() => {
        console.log("Database Connecteed");
    })
    .catch(err => {
        console.log("OHH Noo Mongo Connection Error!");
        console.log(err);
    });

//Creating a function to select samples from cities array
const sample = (arr) => arr[Math.floor(Math.random() * arr.length)]; 

//We will first delete all the existing data in the database before seeding it
const seedDB = async () => {
    await Campground.deleteMany({});
    //Seed new data by using loops
    for (let i = 0; i < 50; i++) {
        let rand = Math.floor(Math.random() * 1000 + 1);
        const camp = new Campground({
            location: `${cities[rand].city}, ${cities[rand].state}`,
            title: `${sample(descriptors)} ${sample(places)}`
        })
        await camp.save();
    }
}

seedDB().then(() => db.close()); //mongoose.connection.close()