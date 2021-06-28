//This is a config file for cloudinary
//Requiring cloudinary specially v2 and cloudinaryStorage from multer 
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

//cloduinary config details
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET
});

//Instance of cloudinary storage
const storage = new CloudinaryStorage({
    cloudinary,
    params:{
        folder: 'YelpCamp',
        allowedFormats: ['jpeg', 'png', 'jpg']         
    } 
});

//Export cloduinary config Object as well as cloudinary storage object
module.exports = {
    cloudinary: cloudinary,
    storage: storage
}