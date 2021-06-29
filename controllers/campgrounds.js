//Clodinary SDK required
const { cloudinary } = require('../cloudinary/index.js');

//Mapbox SDK (Gercoding forward)
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
//Mapbox token and Configuring MapBox
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geoCoder = mbxGeocoding({ accessToken: mapBoxToken });


//Model related to the Route
const Campground = require('../models/campground.js');

//Logic of ROUTES of campground
//index route of campground
module.exports.index = async (req, res, next) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index.ejs', {
        campgrounds: campgrounds
    });
}

//new route of campground
module.exports.renderNewForm = (req, res) => {
    res.render('campgrounds/new.ejs');
}

//create route of campground
module.exports.createCampground = async (req, res, next) => {
    //Geocoding using Mapbox
    const geoData = await geoCoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send();
    //fetch all campground information and create an instance
    const campground = new Campground(req.body.campground);
    //Mapbox location add it here
    campground.geometry = geoData.body.features[0].geometry;
    //Use req.files from multer and map over each file and return an object at each index with filename and url
    //Append mapped files which are in perfect format to campground modelimages
    //As campground.images is an array it will hold all mapped files at indexes
    campground.images = req.files.map(file => ({url: file.path, filename: file.filename}));
    //add author or user to the instace
    campground.author = req.user._id
    console.log(campground);
    await campground.save();
    //Adding flash message to req
    req.flash('success', 'Successfully made a new campground');
    res.redirect(`/campgrounds/${campground._id}`);
}

//show route of campground
module.exports.showCampground = async (req, res, next) => {
    const {
        id
    } = req.params;
    const campground = await Campground.findById(id).populate({
      path: 'reviews',
      populate: {
          path: 'author'
      }  
    }).populate('author');
    //if campground was deleted or not found (url tampering)
    if(!campground) {
        //flash a message and redirect to the index page rather than individual campground
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show.ejs', {
        campground: campground
    });
}

//edit route 
module.exports.renderEditForm = async (req, res, next) => {
    const campground = await Campground.findById(req.params.id);
    //if campground was deleted or not found (url tampering)
    if(!campground) {
        //flash a message and redirect to the index page rather than individual campground
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit.ejs', {
        campground: campground
    });
}

//update route
module.exports.updateCampground = async (req, res, next) => {
    //Update the following campground
    //Here we get id from first and the second returns us the value of campground object
    const campground = await Campground.findByIdAndUpdate(req.params.id, {
        ...req.body.campground
    }, {
        new: true,
        useFindAndModify: false
    });
    //fetch campground images added from multer upload and push them along with the previous images
    //The whole req.files... code returns us an Array but we have defined in our Schema it's an array with object having strings
    //This is why what we do is we spread the array so when it's pushed it's multiple object with comma sperator thus different elements
    campground.images.push(...req.files.map(file => ({url: file.path, filename: file.filename})));
    //Save the changes made to images
    await campground.save();
    //Now check if there are images to delete
    //If there exists deleteImages array
    if(req.body.deleteImages) {
        //Remove or destroy image from cloudinary
        for(let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        //Remove or pull it out of the campground
        await campground.updateOne({ $pull: { images: {filename : { $in: req.body.deleteImages}}}});
        console.log(campground);
    }
    // Flash message on updating campground
    req.flash('success', 'Successfully updated campground!');
    res.redirect(`/campgrounds/${campground._id}`)
}

//delete route
module.exports.deleteCampground = async (req, res, next) => {
    //Delete the following campground
    await Campground.findByIdAndDelete(req.params.id);
    req.flash('success', 'Successfully deleted campground!');
    res.redirect(`/campgrounds`);
}