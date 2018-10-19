const mongoose = require("mongoose");
const Store = mongoose.model("Store");

exports.homePage = (req, res) => {
  res.render("index");
};

exports.addStore = (req, res) => {
  res.render("editStore", { title: "Add Store" });
};

//In order to catch errors in async/await, the usual solution is to wrap it entirely in a try/catch
//However, we can use 'composition' to wrap creatStore() to handle our error handling
exports.createStore = async (req, res) => {
  const store = await new Store(req.body).save();
  req.flash(
    "success",
    `Successfully Created ${store.name}. Care to leave a review?`
  );

  res.redirect(`/store/${store.slug}`);
};
