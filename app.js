//Require all the important dependencies at the top
const express = require('express');
const app = express();
const path = require('path');

//Developer created Model and dependencies
const Campground = require('./models/campground.js');

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

//Setting up the view engine and it's directory
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

//Setting up all routes (CRUD protocol)
app.get('/', (req, res) => {
    res.render('home.ejs');
});

//Index Route (Where all campgrounds are shown)
app.get('/campgrounds', async(req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index.ejs', {campgrounds: campgrounds});
});

//Show Route (Where we will show detailed information of specific campground)
app.get('/campgrounds/:id', async(req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    res.render('campgrounds/show.ejs', {campground: campground});
});

app.listen(3000, () => console.log('Serving on Port 3000'));