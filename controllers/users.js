//Models and other modules required
const User = require('../models/user');

//Create Route for User
module.exports.renderRegister = (req, res) => {
    res.render('users/register.ejs');
}

//New Route for User
module.exports.Register = async (req, res, next) => {
    try {
        const {
            username,
            email,
            password
        } = req.body;
        const user = await new User({
            username: username,
            email: email
        });
        //registering user through passport (Inserting in database with hash password)
        const registeredUser = await User.register(user, password);
        //Call the method req.login to login registered user(passport method)
        req.login(registeredUser, err => {
            if (err) {
                return next(err);
            }
            //adding flash message for successful login
            req.flash('success', 'Welcome to Yelp Camp!');
            //redirecting on homepage
            res.redirect('/campgrounds');
        });
    } catch (e) {
        req.flash('error', e.message);
        //redirecting to register page again
        res.redirect('/register');
    }
}

//Login Route (Create Route)
module.exports.renderLogin = (req, res) => {
    res.render('users/login.ejs');
}

//Login Route (USing passport)
module.exports.login = (req, res) => {
    req.flash('success', 'Welcome back');
    //Fetch user req object the url where user should be redirected
    const redirectUrl = req.session.returnTo || '/campgrounds';
    //delete the returnTo property from session object
    delete req.session.returnTo;
    res.redirect(redirectUrl);
}

//Logout Route (Destroy Route)
module.exports.logout =  (req, res) => {
    //We get this method with passport
    req.logout();
    req.flash('success', 'Goodbye!');
    res.redirect('/campgrounds');
}