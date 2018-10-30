//This file acts as a configuration for the Passport.js package

const passport = require("passport");
const mongoose = require("mongoose");
const User = mongoose.model("User");

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
