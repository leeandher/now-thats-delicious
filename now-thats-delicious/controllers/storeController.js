exports.myMiddleware = (req, res, next) => {
  req.name = "Leander";
  next();
};

exports.homePage = (req, res) => {
  res.render("index");
};
