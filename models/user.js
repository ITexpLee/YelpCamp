//Requiring all important dependencies on top
const mongoose = require('mongoose');
const {
    Schema
} = mongoose;
const passportLocalMongoose = require('passport-local-mongoose'); // It is when using passport with mongoose

//Creating model schema with passport
const userSchema = new Schema({
    email: {
        type: String,
        required: [true, 'Please enter your email'],
        unique: true
    }
});

//Adding passport plugin for username and password
userSchema.plugin(passportLocalMongoose);

//export it to app.js
module.exports = mongoose.model('User', userSchema);