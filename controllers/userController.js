const mongoose = require("mongoose");
const promisify = require("es6-promisify");

const User = mongoose.model("User");

exports.loginForm = (req, res) => {
  res.render("login", { title: "Login" });
};

exports.registerForm = (req, res) => {
  res.render("register", { title: "Register" });
};

exports.register = async (req, res, next) => {
  //Create the user
  const user = new User({ name: req.body.name, email: req.body.email });
  //.register(createdUser, password, callback)
  //User.register(user, req.body.password, function(err, user) {});
  //Since .register returns a callback, we need to turn it into a promise and await that
  const register = promisify(User.register, User);
  await register(user, req.body.password);
  next(); //pass to authController.login
};

//These validation methods come from 'express-validator'
exports.validateRegister = (req, res, next) => {
  req.sanitizeBody("name");
  req.checkBody("name", "You must supply a name!").notEmpty();
  req.checkBody("email", "That email is not valid!").isEmail();
  req.sanitizeBody("email").normalizeEmail({
    remove_dots: false,
    remove_extension: false,
    gmail_remove_subaddress: false
  });
  req.checkBody("password", "Password cannot be blank!").notEmpty();
  req
    .checkBody("password-confirm", "Confirmed Password cannot be blank!")
    .notEmpty();
  req
    .checkBody("password-confirm", "Oops! Your passwords do not match!")
    .equals(req.body.password);

  const errors = req.validationErrors();
  if (errors) {
    req.flash("error", errors.map(err => err.msg));
    res.render("register", {
      title: "Register",
      body: req.body,
      flashes: req.flash()
    });
    return;
  }

  next();
};

exports.account = (req, res) => {
  res.render("account", { title: "Edit Your Account" });
};

exports.updateAccount = async (req, res) => {
  const updates = {
    name: req.body.name,
    email: req.body.email
  };
  const user = await User.findOneAndUpdate(
    { _id: req.user._id }, //Query
    { $set: updates }, //Updates
    { new: true, runValidators: true, context: "query" } //Options
  );
  req.flash("success", "👍 Updated your profile! 👍");
  res.redirect("back");
};
