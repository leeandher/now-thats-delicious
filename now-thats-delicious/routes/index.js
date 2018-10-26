const express = require("express");
const router = express.Router();
const storeController = require("../controllers/storeController");
const userController = require("../controllers/userController");
const authController = require("../controllers/authController");

const { catchErrors } = require("../handlers/errorHandlers");

//Homepage and /stores render all stores
router.get("/", catchErrors(storeController.getStores));
router.get("/stores", catchErrors(storeController.getStores));
//Navigating to /add
router.get("/add", storeController.addStore);
//Posting to create a store on /add
router.post(
  "/add",
  storeController.upload,
  catchErrors(storeController.resize),
  catchErrors(storeController.createStore)
);
//Updating a store through /stores/:id/edit
router.post(
  "/add/:id",
  storeController.upload,
  catchErrors(storeController.resize),
  catchErrors(storeController.updateStore)
);
//Show the existing store page
router.get("/stores/:id/edit", catchErrors(storeController.editStore));

//Show the store page
router.get("/stores/:slug", catchErrors(storeController.getStoreBySlug));

//Show the tags apge
router.get("/tags/", catchErrors(storeController.getStoresByTag));
//Filter tags by specific tag
router.get("/tags/:tag", catchErrors(storeController.getStoresByTag));

router.get("/register", userController.registerForm);
router.post(
  "/register",
  userController.validateRegister,
  userController.register,
  authController.login
);
//Validate the registration data
//Register the user
//Log them in

//TODO Ensure a bad login does not clear form

router.get("/login", userController.loginForm);
router.post("/login", userController.loginForm);

module.exports = router;
