const mongoose = require("mongoose");
const Store = mongoose.model("Store");
const User = mongoose.model("User");

const multer = require("multer"); //For uploading
const jimp = require("jimp"); //For resizing
const uuid = require("uuid"); //For generating unique IDs

const AWS = require("aws-sdk");

const multerOptions = {
  //Save the image to memory, not disk (use then discard)
  storage: multer.memoryStorage(),
  //ES6 for --> fileFilter: function(req, file, next) {...}
  fileFilter(req, file, next) {
    //mimetype is a trusted file descriptor (rather than extension)
    const isPhoto = file.mimetype.startsWith("image/");
    if (isPhoto) {
      //next(err) --> an error occured
      //next(null, val) --> it worked
      next(null, true);
    } else {
      next({ message: "That filetype isn't allowed!" }, false);
    }
  }
};

exports.homePage = (req, res) => {
  res.render("index");
};

exports.addStore = (req, res) => {
  res.render("editStore", { title: "Add Store" });
};

//Handle upload on the single, 'photo' field
exports.handleUpload = multer(multerOptions).single("photo");

exports.resize = async (req, res, next) => {
  //Check if there is no new file to resize
  if (!req.file) return next(); //multer puts the file on the request (i.e. req.file)

  const extension = req.file.mimetype.split("/")[1];
  req.body.photo = `${uuid.v4()}.${extension}`;
  //Next step, resize
  const photo = await jimp.read(req.file.buffer);
  await photo.resize(800, jimp.AUTO);

  //Attach the photo data to the response
  res.locals.uploadPhoto = await photo.getBufferAsync(req.file.mimetype);

  next();
};

exports.uploadToS3 = async (req, res, next) => {
  //If no photo is coming with the request, skip ahead
  if (!res.locals.uploadPhoto) return next();

  const s3 = new AWS.S3();

  //Upload the resized image to the S3 Bucket
  s3.putObject({
    Body: res.locals.uploadPhoto,
    Bucket: process.env.IMG_S3_BUCKET_NAME,
    Key: `uploads/${req.body.photo}`
  })
    .promise()
    .then(data => console.log("Image has been uploaded to S3 successfully!"))
    .catch(err => console.log(err, err.stack));

  next();
};

//In order to catch errors in async/await, the usual solution is to wrap it entirely in a try/catch
//However, we can use 'composition' to wrap createStore() to handle our error handling
exports.createStore = async (req, res) => {
  req.body.author = req.user._id; //Get the current user's id
  const store = await new Store(req.body).save();
  req.flash(
    "success",
    `Successfully Created <strong>${
      store.name
    }</strong>. Care to leave a review?`
  );

  res.redirect(`/stores/${store.slug}`);
};

exports.getStores = async (req, res) => {
  //Get the current page (or default to 0)
  const page = req.params.page || 1;
  //Define our limit per page
  const limit = 6;
  //Define how many we should skip
  const skip = page * limit - limit;

  //Create the two promises
  const storesPromise = Store.find()
    .skip(skip)
    .limit(limit)
    .sort({ created: "desc" }); //Sort by the most recently created
  const countPromise = Store.count();

  //Evaluate them in parallel
  const [stores, count] = await Promise.all([storesPromise, countPromise]);

  //Evaluate our total pages
  const pages = Math.ceil(count / limit);

  //If the user tries an exceedingly large page number
  if (!stores.length && skip) {
    req.flash(
      "info",
      `Hey, You asked for page ${page}, but I couldn't find it, so I put you on page ${pages}`
    );
    return res.redirect(`/stores/pages/${pages}`);
  }

  //Render the page!
  res.render("stores", { title: "Stores", stores, page, pages, count });
};

exports.getStoreBySlug = async (req, res, next) => {
  //1. Find the store, given the slug
  const store = await Store.findOne({ slug: req.params.slug }).populate(
    "author reviews"
  );
  //2. If no store was found, skip to error handling
  if (!store) return next();
  //3. Render the store page
  res.render("store", { title: store.name, store });
};

exports.getStoresByTag = async (req, res, next) => {
  //The given tag
  const tag = req.params.tag;
  //If no given tag, look for all stores with any tag
  const tagQuery = tag || { $exists: true };

  //Create the promises
  const tagsPromise = Store.getTagsList(); //To find tags, and their counts
  const storesPromise = Store.find({ tags: tagQuery }); //To find stores by the tagQuery

  //await both Promises in parallel
  const [tags, stores] = await Promise.all([tagsPromise, storesPromise]);

  //Render the tag page with all the queried info
  res.render("tag", { title: "Tags", tags, tag, stores });
};

exports.getStoresByHearts = async (req, res, next) => {
  const stores = await Store.find({
    _id: {
      $in: req.user.hearts
    }
  });
  res.render("stores", { title: "Hearted Stores", stores });
};

const confirmOwner = (store, user) => {
  return store.author.equals(user._id);
  //Throwing an error will stop the request as well
  // throw Error("You must own the store to edit it!");
};

exports.editStore = async (req, res) => {
  //1. Find the store, given the ID
  const store = await Store.findOne({ _id: req.params.id });
  //2. Confirm that the user is the owner of the store
  if (!confirmOwner(store, req.user)) {
    req.flash("error", "😵 You must own the store in order to edit it! 😵");
    res.redirect("back");
  }
  //3. Render the edit form for the specific store
  res.render("editStore", { title: `Edit ${store.name}`, store });
};

exports.updateStore = async (req, res) => {
  //1. Set the location data to be a point
  req.body.location.type = "Point";
  //2. Find the store, given the ID, and Update
  //.findOneAndUpdate(query, update, {...options})
  const store = await Store.findOneAndUpdate({ _id: req.params.id }, req.body, {
    new: true, //Return the new store, not the old one
    runValidators: true //Run the required validators against the model
  }).exec();
  //3. Redirect them to the store edit page, telling them it worked
  req.flash(
    "success",
    `Successfully updated <strong>${store.name}</strong>. <a href="/stores/${
      store.slug
    }">View Store →</a>`
  );
  res.redirect(`/stores/${store._id}/edit`);
};

exports.searchStores = async (req, res) => {
  const stores = await Store
    //Find stores that match the query
    .find(
      {
        $text: {
          $search: req.query.q
        }
      },
      //Create a projection
      { score: { $meta: "textScore" } }
    )
    //Sort them by the projection
    .sort({
      score: { $meta: "textScore" }
    })
    //Limit to only five results
    .limit(5);
  res.json(stores);
};

exports.mapStores = async (req, res) => {
  //MongoDB uses coordinates as [longitude, latitude]
  const coordinates = [req.query.lng, req.query.lat].map(parseFloat);

  //Using MongoDB operators to do calculations
  const q = {
    location: {
      $near: {
        $geometry: {
          type: "Point",
          coordinates
        },
        $maxDistance: 10000 //10km
      }
    }
  };

  //Limit the overhead content in the AJAX request
  const stores = await Store.find(q)
    .select("name slug description location photo")
    .limit(10);

  res.json(stores);
};

exports.mapPage = (req, res) => {
  res.render("map", { title: "Map" });
};

//When the user 'hearts' a store
exports.heartStore = async (req, res) => {
  //Get their list of hearts
  const hearts = req.user.hearts.map(obj => obj.toString());
  //Decide whether to add/remove this stroe
  const operator = hearts.includes(req.params.id) ? "$pull" : "$addToSet";
  //Update
  const userHearts = await User.findOneAndUpdate(
    { _id: req.user._id },
    {
      [operator]: { hearts: req.params.id }
    },
    { new: true }
  ).select("hearts");
  res.json(userHearts);
};

exports.getTopStores = async (req, res) => {
  const stores = await Store.getTopStores();
  res.render("topStores", { stores, title: "⭐ Top Stores!" });
};
