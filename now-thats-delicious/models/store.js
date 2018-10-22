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
  tags: [String],
  created: {
    type: Date,
    default: Date.now
  },
  location: {
    type: {
      type: String,
      default: "Point"
    },
    coordinates: [
      {
        type: Number,
        required: "You must supply come coordinates"
      }
    ],
    address: {
      type: String,
      required: "You must supply an address!"
    }
  },
  photo: String
});

//TODO: Force unique slugs
storeSchema.pre("save", function(next) {
  //Skip it and stop this function
  if (!this.isModified("name")) return next();
  //Create the slug
  this.slug = slug(this.name);
  next();
});

module.exports = mongoose.model("Store", storeSchema);
