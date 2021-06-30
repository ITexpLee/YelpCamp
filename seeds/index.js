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
  for (let i = 0; i < 200; i++) {
    let rand = Math.floor(Math.random() * 1000 + 1);
    let price = Math.floor(Math.random() * 20) + 10;
    const camp = new Campground({
      author: '60d6e2a874fd5e3a90fc14a1',
      location: `${cities[rand].city}, ${cities[rand].state}`,
      title: `${sample(descriptors)} ${sample(places)}`,
      images: [{
          url: 'https://res.cloudinary.com/manali-camp/image/upload/v1624985025/YelpCamp/dop78f6os8myyevryoxb.jpg',
          filename: 'YelpCamp/dop78f6os8myyevryoxb'
        },
        {
          url: 'https://res.cloudinary.com/manali-camp/image/upload/v1624985032/YelpCamp/cnahd7zr4vf9fwl5xtqg.jpg',
          filename: 'YelpCamp/cnahd7zr4vf9fwl5xtqg'
        },
        {
          url: 'https://res.cloudinary.com/manali-camp/image/upload/v1624985036/YelpCamp/hxefb7cm9odoxo2xpvhv.jpg',
          filename: 'YelpCamp/zwwfzfrvbqgyewdzmefu'
        }
      ],
      geometry: {
        type: "Point",
        coordinates: [
          cities[rand].longitude,
          cities[rand].latitude
        ]
      },
      description: `Lorem ipsum dolor sit, amet consectetur adipisicing elit. Blanditiis, animi. Optio tenetur iste, excepturi repellat, autem eum voluptate nisi fuga atque blanditiis`,
      price: price,
    })
    await camp.save();
  }
}

seedDB().then(() => db.close()); //mongoose.connection.close()