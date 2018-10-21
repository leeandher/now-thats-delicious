const mongoose = require("mongoose");
const Store = mongoose.model("Store");

exports.homePage = (req, res) => {
  res.render("index");
};

exports.addStore = (req, res) => {
  res.render("editStore", { title: "Add Store" });
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

  res.redirect(`/store/${store.slug}`);
};

exports.getStores = async (req, res) => {
  //1. Query the DB for the list of all stores
  const stores = await Store.find();
  res.render("stores", { title: "Stores", stores });
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
  req.body.locaation.type = "Point";
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
