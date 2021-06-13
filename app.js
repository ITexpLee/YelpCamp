//Require all the important dependencies at the top
const express = require('express');
const app = express();
const path = require('path');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');

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
app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

//All Express middleware 
app.use(express.urlencoded({extended: true}));  //req.body is parsed as a form
app.use(methodOverride('_method')); //Setting the query for method-override

//Setting up all routes (CRUD protocol)
app.get('/', (req, res) => {
    res.render('home.ejs');
});

//Index Route (Where all campgrounds are shown)
app.get('/campgrounds', async(req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index.ejs', {campgrounds: campgrounds});
});

//Create Route (form page)
app.get('/campgrounds/new', (req, res) => {
    res.render('campgrounds/new.ejs');
})

//Create Route (Submitted) (end point)
app.post('/campgrounds', async (req, res) => {
    const campground = new Campground(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
})

//Show Route (Where we will show detailed information of specific campground)
app.get('/campgrounds/:id', async(req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    res.render('campgrounds/show.ejs', {campground: campground});
});

//Edit/Update Route (form Page)
app.get('/campgrounds/:id/edit', async(req, res) => {
    //fetch data of campground to be edited
    const campground = await Campground.findById(req.params.id);
    res.render('campgrounds/edit.ejs', {campground: campground});
});

//Update Route (Patch/Put request)
app.put('/campgrounds/:id', async (req, res) => {
    //Update the following campground
    //Here we get id from first and the second returns us the value of campground object
    const campground = await Campground.findByIdAndUpdate(req.params.id, {...req.body.campground}, {new: true, useFindAndModify: false});
    res.redirect(`/campgrounds/${campground._id}`);
});

//Delete Route
app.delete('/campgrounds/:id', async (req, res) => {
    //Delete the following campground
    await Campground.findByIdAndDelete(req.params.id);
    res.redirect(`/campgrounds`);
});

app.listen(3000, () => console.log('Serving on Port 3000'));