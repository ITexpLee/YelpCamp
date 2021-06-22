//Require all the important dependencies at the top
const express = require('express');
const app = express();
const path = require('path');
const ejsMate = require('ejs-mate'); //changing default engine to ejs-mate from ejs
const methodOverride = require('method-override');
const ExpressError = require('./utilities/expressError'); //Error related dependencies user + module

//Our Route files go here
const campgrounds = require('./routes/campgrounds.js');
const reviews = require('./routes/reviews.js');

//Connecting to mongoose and mongoDB
const mongoose = require('mongoose');
const {
    string
} = require('joi');
mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
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


//All Express middleware/ Static files
app.use(express.urlencoded({
    extended: true
})); //req.body is parsed as a form
app.use(methodOverride('_method')); //Setting the query for method-override
app.use(express.static(path.join(__dirname, 'public')));

//Setting up all routes (CRUD protocol)
app.get('/', (req, res) => {
    res.render('home.ejs');
});

//Campground Routes go here
app.use('/campgrounds', campgrounds);

//Review Routes go here
app.use('/campgrounds/:id/reviews', reviews);

//App route for all
app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404));
})

//Error handling middleware 
app.use((err, req, res, next) => {
    //As wr are directly sending error object we need to give it default
    const {
        statusCode = 500
    } = err;
    if (!err.message) err.message = 'Ohh there was something wrong';
    res.status(statusCode).render('error.ejs', {
        err
    });
});

app.listen(3000, () => console.log('Serving on Port 3000'));