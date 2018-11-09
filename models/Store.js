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
  photo: String,
  author: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: "You must supply an author!"
  }
});

//Define our indexes
//We've indexed these fields into a 'compound index'
//This will let us search through both fields at once
storeSchema.index({ name: "text", description: "text" });
storeSchema.index({ location: "2dsphere" });

storeSchema.pre("save", async function(next) {
  //If the name hasn't been changed, skip it and stop this function
  if (!this.isModified("name")) return next();

  //Create the slug
  this.slug = slug(this.name);

  //Find other stores that have an existing slug (and their numerations)
  const slugRegExp = new RegExp(`^(${this.slug})((-[0-9]*$)?)$`, "i"); //Create the search RegExp
  const storesWithSlug = await this.constructor.find({ slug: slugRegExp }); //Create an array of all matches
  if (storesWithSlug.length) {
    this.slug = `${this.slug}-${storesWithSlug.length + 1}`; //Add the appropriate number to the end of the slug
  }
  next();
});

storeSchema.statics.getTagsList = function() {
  return this.aggregate([
    { $unwind: "$tags" }, //Create a new entry per tag
    { $group: { _id: "$tags", count: { $sum: 1 } } }, //Group the entries by unique tag, then count
    { $sort: { count: -1 } } //Sort by count descending
  ]); //output --> an array of tag objects sorted from most used to least
};

storeSchema.virtual("reviews", {
  ref: "Review", //Which model to JOIN with
  localField: "_id", //Which field on THIS model
  foreignField: "store" //Which field on THAT model
});

module.exports = mongoose.model("Store", storeSchema);
