const mongoose = require("mongoose");
mongoose.Promise = global.Promise;
const slug = require("slugs");

//By default create a strict schema (don't allow any other keys/values)
const storeSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: "Please enter a store name!"
  },
  slug: String,
  description: {
    type: String,
    trim: true
  },
  tags: [String]
});

//TODO: Force unique slugs
storeSchema.pre("save", function(next) {
  if (!this.isModified("name")) {
    //Skip it and stop this function
    return next();
  }
  this.slug = slug(this.name);
  next();
});

module.exports = mongoose.model("Store", storeSchema);
