//Check if user has loggedIn or not
//When we need to transfer method we use this syntax
module.exports.isLoggedIn = (req, res, next) => {
    if(!req.isAuthenticated()){
        //if not logged in we add url of user location 
        req.session.returnTo = req.originalUrl;
        req.flash('error', 'you must be signed in first!');
        return res.redirect('/login');
    }
    next();
}

