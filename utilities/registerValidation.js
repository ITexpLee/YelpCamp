//Required modules
const User = require('../models/user.js')

module.exports.registerValidation = async function (email, password) {

    const checkEmail = await User.find({
        email: email
    });
    if (checkEmail.length !== 0) {
        req.flash('error', 'Email already exists');
        return res.redirect('/register');
    };

    const validPassword = await checkPassword(password);
    if (!validPassword) {
        return res.redirect('/register');
    }

}

function checkPassword(password) {
    const regex = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
    if (!password.match(regex)) {
        req.flash('error', 'Your Password must contain min 8 letter password, with at least a symbol, upper and lower case letters and a number');
        return false;
    }
    return true;
}

// Check for password
const regex = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
const checkPassword = await (password.match(regex));
if (!password.match(regex)) {
    req.flash('error', 'Your Password must contain min 8 letter password, with at least a symbol, upper and lower case letters and a number');
    console.log(!password.match(regex));
    return res.redirect('/register');
}