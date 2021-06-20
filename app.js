//Require all the important dependencies at the top
const express = require('express');
const app = express();
const path = require('path');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate'); //changing default engine to ejs-mate from ejs
const ExpressError = require('./utilities/expressError'); //Error related dependencies user + module
const catchAsync = require('./utilities/catchAsync');
const { campgroundSchema, reviewSchema } = require('./userMiddleware/joiErrorSchema'); //It is created with Joi which is then used to validate

//Developer created Model and dependencies
const Campground = require('./models/campground.js');
const Review = require('./models/review.js')

//Connecting to mongoose and mongoDB
const mongoose = require('mongoose');
const {
    string
} = require('joi');
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


//All Express middleware/ Static files
app.use(express.urlencoded({
    extended: true
})); //req.body is parsed as a form
app.use(methodOverride('_method')); //Setting the query for method-override
app.use(express.static(path.join(__dirname, 'public')));

//Defining our own express error handling middleware
//Creating out Joi Schema 
const validateCampground = (req, res, next) => {
    //Once schema is defined we validate it by using validate method on the schema and passing req.body 
    // or whatever you want to validate in it
    const {
        error
    } = campgroundSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        //Otherwise even if there isn't an error it won't be passed to the route
        next();
    }
}

//Defining our own express error handling middleware
//Creating out Joi Schema 
const validateReview = (req, res, next) => {
    //Once schema is defined we validate it by using validate method on the schema and passing req.body 
    // or whatever you want to validate in it
    const {
        error
    } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        //Otherwise even if there isn't an error it won't be passed to the route
        next();
    }
}

//Setting up all routes (CRUD protocol)
app.get('/', (req, res) => {
    res.render('home.ejs');
});

//Index Route (Where all campgrounds are shown)
app.get('/campgrounds', catchAsync(async (req, res, next) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index.ejs', {
        campgrounds: campgrounds
    });
}));

//Create Route (form page)
app.get('/campgrounds/new', (req, res) => {
    res.render('campgrounds/new.ejs');
});

//Create Route (Submitted) (end point)
app.post('/campgrounds', validateCampground, catchAsync(async (req, res, next) => {
    const result = campgroundSchema.validate(req.body);
    const campground = new Campground(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
}));

//Show Route (Where we will show detailed information of specific campground)
app.get('/campgrounds/:id', catchAsync(async (req, res, next) => {
    const {
        id
    } = req.params;
    const campground = await Campground.findById(id);
    res.render('campgrounds/show.ejs', {
        campground: campground
    });
}));

//Edit/Update Route (form Page)
app.get('/campgrounds/:id/edit', catchAsync(async (req, res, next) => {
    //fetch data of campground to be edited
    const campground = await Campground.findById(req.params.id);
    res.render('campgrounds/edit.ejs', {
        campground: campground
    });
}));

//Update Route (Patch/Put request)
app.put('/campgrounds/:id', validateCampground, catchAsync(async (req, res, next) => {
    //Update the following campground
    //Here we get id from first and the second returns us the value of campground object
    const campground = await Campground.findByIdAndUpdate(req.params.id, {
        ...req.body.campground
    }, {
        new: true,
        useFindAndModify: false
    });
    res.redirect(`/campgrounds/${campground._id}`)
}));

//Delete Route
app.delete('/campgrounds/:id', catchAsync(async (req, res, next) => {
    //Delete the following campground
    await Campground.findByIdAndDelete(req.params.id);
    res.redirect(`/campgrounds`);
}));

//Review Route after all camp Routes
app.post('/campgrounds/:id/reviews', validateReview, catchAsync(async (req, res, next) => {
    //Fetch our campground from DB
    const campground = await Campground.findById(req.params.id);
    //Create review instance
    const review = new Review(req.body.review);
    //push it into campground
    campground.reviews.push(review);
    //save both of them
    await review.save();
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
}));

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