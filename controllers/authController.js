const passport = require("passport");
const crypto = require("crypto"); //Built-in sequence generator within Node.js
const promisify = require("es6-promisify");
const mail = require("../handlers/mail");

const mongoose = require("mongoose");

const User = mongoose.model("User");

//"local" --> type of strategy on Passport.js
exports.login = passport.authenticate("local", {
  failureRedirect: "/login",
  failureFlash: "Failed Login!",
  successRedirect: "/",
  successFlash: "You are now logged in!"
});

exports.logout = (req, res) => {
  req.logout();
  req.flash("success", "👋 You are now logged out! 👋");
  res.redirect("/");
};

exports.isLoggedIn = (req, res, next) => {
  //Check if the user is authenticated
  if (req.isAuthenticated()) {
    next(); //They are logged in
  } else {
    req.flash("error", "🛑 Sorry, you gotta log in first! 🛑");
    res.redirect("back");
  }
};

exports.forgot = async (req, res) => {
  //1. See if that user's email is in the DB
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    req.flash(
      "error",
      //This is a known security issue, disclosing non-associated emails
      //For demonstration/learning purposes, it's okay to do this
      //In production, consider alerting 'The email has been sent' regardless if there exists an account
      "🤷‍ Coudn't find an account associated with that email 🤷‍"
    );
    return res.redirect("/login");
  }

  //2. Set reset token and expiry on the account
  user.resetPasswordToken = crypto.randomBytes(20).toString("hex");
  user.resetPasswordExpires = Date.now() + 3600000; //1 hour from now
  await user.save();

  //3. Send them an email with the token
  const resetURL = `http://${req.headers.host}/account/reset/${
    user.resetPasswordToken
  }`;
  await mail.send({
    user,
    resetURL,
    subject: "Password Reset",
    template: "password-reset"
  });
  req.flash("success", `You have been sent a password reset link.`);

  //4. Redirect them to the login page
  res.redirect("/login");
};

exports.verifyResetToken = async (req, res, next) => {
  //Find the user if the token is valid, and not expired
  const user = await User.findOne({
    resetPasswordToken: req.params.token,
    resetPasswordExpires: { $gt: Date.now() }
  });
  if (!user) {
    req.flash(
      "error",
      "🙅‍‍ ‍‍‍The password reset token is invalid or has expired! 🙅‍"
    );
    return res.redirect("/login");
  }

  //Attach the user to the request
  res.locals.resetUser = user;
  next(); //User & token have been verified!
};

exports.resetForm = async (req, res) => {
  res.render("reset", { title: "Reset Your Password" });
};

exports.confirmedPasswords = (req, res, next) => {
  if (req.body.password === req.body["password-confirm"]) return next();
  req.flash("error", "❌ Your passwords do not match! ❌");
  res.redirect("back");
};

exports.updatePassword = async (req, res) => {
  //Get the user from the verifyResetToken middleware
  const user = res.locals.resetUser;
  const setPassword = promisify(user.setPassword, user);
  await setPassword(req.body.password);
  //Get rid of the fields from MongoDB
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  const updatedUser = await user.save();
  await req.login(updatedUser);
  req.flash(
    "success",
    "😎 Your password has been reset, you are now logged in! 😎"
  );
  res.redirect("/");
};
