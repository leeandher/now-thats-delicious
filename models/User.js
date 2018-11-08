const mongoose = require("mongoose");
mongoose.Promise = global.Promise;

const md5 = require("md5"); //Creates email hash
const validator = require("validator"); //Validates input
const mongodbErrorHandler = require("mongoose-mongodb-errors");
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true,
    validate: [validator.isEmail, "Invalid Email Address"],
    required: "Please supply an email address"
  },
  name: {
    type: String,
    trim: true,
    required: "Please supply a name"
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  hearts: [{ type: mongoose.Schema.ObjectId, ref: "Store" }]
});

userSchema.virtual("gravatar").get(function() {
  const hash = md5(this.email);
  return `https://gravatar.com/avatar/${hash}?s=200`;
});

//passportLocalMongoose
//Adds a bunch of custom methods to our User schema
//usernameField specifies which field on our schema to use for login
userSchema.plugin(passportLocalMongoose, { usernameField: "email" });

//Cleans up how the userSchema.emmail.validate error looks when conflicted with {unique: true}
userSchema.plugin(mongodbErrorHandler);

module.exports = mongoose.model("User", userSchema);
