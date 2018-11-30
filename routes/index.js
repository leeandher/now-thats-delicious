const express = require("express");
const router = express.Router();
const storeController = require("../controllers/storeController");
const userController = require("../controllers/userController");
const reviewController = require("../controllers/reviewController");
const authController = require("../controllers/authController");

const { catchErrors } = require("../handlers/errorHandlers");

//Homepage and /stores render all stores
router.get("/", catchErrors(storeController.getStores));
router.get("/stores", catchErrors(storeController.getStores));
router.get("/stores/page/:page", catchErrors(storeController.getStores));
//Navigating to /add
router.get("/add", authController.isLoggedIn, storeController.addStore);
//Posting to create a store on /add
router.post(
  "/add",
  storeController.handleUpload,
  catchErrors(storeController.resize),
  catchErrors(storeController.uploadToS3),
  catchErrors(storeController.createStore)
);
//Updating a store through /stores/:id/edit
router.post(
  "/add/:id",
  storeController.handleUpload,
  catchErrors(storeController.resize),
  catchErrors(storeController.uploadToS3),
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

router.get("/logout", authController.logout);

//TODO Ensure a bad login does not clear form

router.get("/login", userController.loginForm);
router.post("/login", authController.login);

router.get("/account", authController.isLoggedIn, userController.account);
router.post("/account", catchErrors(userController.updateAccount));

router.get(
  "/hearts",
  authController.isLoggedIn,
  catchErrors(storeController.getStoresByHearts)
);

//Handle password reset
router.post("/account/forgot", catchErrors(authController.forgot));
router.get(
  "/account/reset/:token",
  catchErrors(authController.verifyResetToken),
  authController.resetForm
);
router.post(
  "/account/reset/:token",
  authController.confirmedPasswords,
  catchErrors(authController.verifyResetToken),
  catchErrors(authController.updatePassword)
);

router.get("/map", storeController.mapPage);
router.get("/top", catchErrors(storeController.getTopStores));

router.post(
  "/reviews/:id",
  authController.isLoggedIn,
  catchErrors(reviewController.oneReviewPerStore),
  catchErrors(reviewController.createReview)
);

/*
    API
*/

router.get("/api/search", catchErrors(storeController.searchStores));
router.get("/api/stores/near", catchErrors(storeController.mapStores));
router.post("/api/stores/:id/heart", catchErrors(storeController.heartStore));

module.exports = router;
