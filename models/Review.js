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

module.exports = mongoose.model("Review", reviewSchema);
