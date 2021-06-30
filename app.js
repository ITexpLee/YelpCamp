//Checking for production or development state for ENV
if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

//Require all the important dependencies at the top
const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose'); //requiring mongoose for database manipulation
const ejsMate = require('ejs-mate'); //changing default engine to ejs-mate from ejs
const methodOverride = require('method-override');
const ExpressError = require('./utilities/expressError'); //Error related dependencies user + module
const User = require('./models/user.js'); //requiring passport model
const mongoSanitize = require('express-mongo-sanitize'); //Sanitize mongo incoming query
const helmet = require('helmet'); //11 middlewares for security

//Cookies, Session, passport and flash package (All Register/Signup stuff)
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport'); //requiring passport for easier authentication
const LocalStratergy = require('passport-local'); //passport stratergy for local signup and login

//Mongo Connect to connect our session to Mongo rather than Memory (It is used to connect session to online Atlas DB)
const MongoStore = require('connect-mongo');

//Our Atlas connection url or localhost
const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp';

//Connecting to mongoose and mongoDB
mongoose.connect(dbUrl, {
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

//Passing on our Secret or production
const secret = process.env.SECRET || 'weshouldhaveabetterstorage';

//Creating Session storage location from mongo connect
const store = MongoStore.create({
    mongoUrl: dbUrl,
    touchAfter: 24 * 3600,
    crypto: {
        secret: secret
    }
});
store.on('error', function (e) {
    console.log("Session Store Error", e)
});

//Middleware related to cookies and session (Memory packages)
//As session cookie is defined on the app.js it can be accessed through any route(global cookie) 
const sessionConfig = {
    store: store,
    name: '_fj',
    secret: secret,
    resave: false, //If there is change in one session variable does it make any change in other (change in onetab no change in other)
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        //for https server
        // secure: true,
        //1000 milliseconds in a sec * 60 sec in a min * 60 mins in an hour * 24 hours in a day * 7 days a week
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig));
app.use(flash());
//Express Middleware for all flash messages bounded to req for all routes 
app.use((req, res, next) => {
    //if there is a success message attached to req
    // res.locals.success = req.flash('success');
    //if there is an error message attached to req
    // res.locals.error = req.flash('error');
    res.locals.messages = {
        'success': req.flash('success'),
        'danger': req.flash('error')
    };
    next();
});
//passport middlewares for initializing and creating consistent session for all request
app.use(passport.initialize());
app.use(passport.session());
//defining the strategy we want to use in order to authenticate
passport.use(new LocalStratergy(User.authenticate()));

//These two plugins are added no matter which strategy used
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//Middleware for sending user info created by passport 
app.use((req, res, next) => {
    //We can also use res.locals to store other info(User info from passport)
    res.locals.currentUser = req.user;
    next();
});

//Our Route files go here
const registerRoutes = require('./routes/users.js');
const campgroundRoutes = require('./routes/campgrounds.js');
const reviewRoutes = require('./routes/reviews.js');

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
//Middleware to sanitize all incoming query (mongo injection safety)
app.use(mongoSanitize({
    //replace $ or . with '_' for safety
    replaceWith: '_'
}));

//Helment middleware to apply security to your app //all 11 woorking helmet middleware
//Content security policy all websites allowed defined for helment
const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net"
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net"
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/manali-camp/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);


//Setting up all routes (CRUD protocol)
app.get('/', (req, res) => {
    res.render('home.ejs');
});

//Register/Login Routes go here
app.use('/', registerRoutes);

//Campground Routes go here
app.use('/campgrounds', campgroundRoutes);

//Review Routes go here
app.use('/campgrounds/:id/reviews', reviewRoutes);

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

//Defining our Port
const port = process.env.PORT || 3000;

app.listen(port, () => console.log(`Serving on Port ${port}`));