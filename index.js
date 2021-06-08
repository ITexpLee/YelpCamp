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

//Routes
app.get('/', (req, res) => {
    res.render('home.ejs');
})

app.get('/makecampground', async(req, res) => {
    const camp = await new Campground({title: 'My Background', description: 'Cheap Camping'});
    await camp.save();
    res.send(camp);
})

app.listen(3000, () => console.log('Serving on Port 3000'));