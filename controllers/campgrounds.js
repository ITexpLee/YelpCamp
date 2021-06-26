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
    //fetch all campground information and create an instance
    const campground = new Campground(req.body.campground);
    //add author or user to the instace
    campground.author = req.user._id
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