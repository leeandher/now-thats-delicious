const mongoose = require("mongoose");
const Review = mongoose.model("Review");

exports.oneReviewPerStore = async (req, res, next) => {
  //1. Find all the review for this store
  const reviews = await Review.find({ store: req.params.id }).select("author");

  //2. Check if this author wrote any of them
  const authors = reviews.map(review => review.author.toString());
  if (authors.includes(req.user._id.toString())) {
    req.flash("error", "😥 Sorry! You can't leave more than one review! 😥");
    res.redirect("back");
  }

  //3. Otherwise, continue
  next();
};

exports.createReview = async (req, res) => {
  //1. Attach the store and user data to the request
  req.body.author = req.user._id;
  req.body.store = req.params.id;

  //2. Save the review
  await new Review(req.body).save();

  //3. Tell the user
  req.flash("success", `😋 Thanks for leaving a review! 😋`);
  res.redirect("back");
};
