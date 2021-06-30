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

// {"_id":{"$oid":"60dca09bcf175832907d2607"},"username":"colt","email":"colt@gmail.com","salt":"8267a10073b86e9a27fd8c78897077211799093e94672bb2431ba07063d2e9b1","hash":"49fc6c41f159012d1c7240ab612f51705fb10078c4948ba825c78861e1de49a10eb507d6f7774152f4477539edb5edbf450f59f65f0144b44c0d790335ddeb8e95b530e13053c03d157ff48a15b506082998274f643ea24520ec0fa5a2901e312bf1975763b1a6299c50f25b51c04f4ff54d1141ecfa002d7019e1feefc8dc98215cfffc9c595e2dd37955a2c27ae03328d4722fce95d6233656188cda34c23822c12894f101759d4900c8e24c196ddae5fa2c55bd1e3c4c06a5172e711236dba8bf34298ae6e0328e33db3909815e0f51d0dc13872b7ef5d6282a92b42afd2e7a100d1492344e3eda92ef3f82dbd80c5cf2013422eacc69952d882f217349aec656296ee3a162c88a65fdd5d2a7753b0a2bb460f13205b31f7a6f0a9998ecdf3c65957c6fe4b86dbfab6b880e9dc961e9eaa542f9ba6ad6e55342e183fd3741d49b6b28a4928cebe162e54672af92a347d7da32a25b147bef1ce431e6b244e6d4371c4e4c3d57617d13bd2682a6f650cc66ce33dd8d809ba2fc672e645a5f5a55fee7bfc79008b6ef83908bca1b21df7d76bce9b1a29207dbac4914a851053623706bc986a4aefe0de40ff1cabbb7c73738554ba70dd61854d169fa125bae4f8c5183651f7af510fbd24747d03058b9465eeb5279e0ce071f456480c10f3c582e4fd5d4935c2193d5a1fd8f77b70c8fa7866fe6687fe67555692939026cbac8","__v":{"$numberInt":"0"}}