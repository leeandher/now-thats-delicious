const mongoose = require("mongoose");
mongoose.Promise = global.Promise;

const reviewSchema = new mongoose.Schema({
  created: {
    type: Date,
    default: Date.now
  },
  store: {
    type: mongoose.Schema.ObjectId,
    ref: "Store"
  },
  text: {
    type: String,
    trim: true
  },
  rating: {
    type: Number,
    required: "Your review needs a rating associated with it!"
  },
  author: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: "You must supply an author!"
  }
});

//Define our hook
function autopopulate(next) {
  this.populate("author");
  next();
}

//Automatically populate author before 'find' and 'findOne'
reviewSchema.pre("find", autopopulate);
reviewSchema.pre("findOne", autopopulate);

module.exports = mongoose.model("Review", reviewSchema);
