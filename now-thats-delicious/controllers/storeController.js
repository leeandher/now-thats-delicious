const mongoose = require("mongoose");
const Store = mongoose.model("Store");
const multer = require("multer");
const jimp = require("jimp");
const uuid = require("uuid");

const multerOptions = {
  storage: multer.memoryStorage(),
  fileFilter(req, file, next) {
    const isPhoto = file.mimetype.startsWith("image/");
    if (isPhoto) {
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

exports.upload = multer(multerOptions).single("photo");

exports.resize = async (req, res, next) => {
  //Check if there is no new file to resize
  if (!req.file) return next(); //Skip to the next middleware

  const extension = req.file.mimetype.split("/")[1];
  req.body.photo = `${uuid.v4()}.${extension}`;
  //Next step, resize
  const photo = await jimp.read(req.file.buffer);
  await photo.resize(800, jimp.AUTO);
  await photo.write(`./public/uploads/${req.body.photo}`);
  //Once the resize has been saved, keep going
  next();
};

//In order to catch errors in async/await, the usual solution is to wrap it entirely in a try/catch
//However, we can use 'composition' to wrap createStore() to handle our error handling
exports.createStore = async (req, res) => {
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
  //1. Query the DB for the list of all stores
  const stores = await Store.find();
  res.render("stores", { title: "Stores", stores });
};

exports.getStoreBySlug = async (req, res, next) => {
  //1. Find the store, given the slug
  const store = await Store.findOne({ slug: req.params.slug });
  //2. If no store was found, skip to error handling
  console.log("finding the store", JSON.stringify(store));
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

exports.editStore = async (req, res) => {
  //1. Find the store, given the ID
  const store = await Store.findOne({ _id: req.params.id });
  //2. Confirm that the user is the owner of the store
  //TO DO
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
