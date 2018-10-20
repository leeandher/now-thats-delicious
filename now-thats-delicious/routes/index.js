const express = require("express");
const router = express.Router();
const storeController = require("../controllers/storeController");

const { catchErrors } = require("../handlers/errorHandlers");

//Homepage and /stores render all stores
router.get("/", catchErrors(storeController.getStores));
router.get("/stores", catchErrors(storeController.getStores));
//Navigating to /add
router.get("/add", storeController.addStore);
//Posting to create a store on /add
router.post("/add", catchErrors(storeController.createStore));
//Updating a store through /stores/:id/edit
router.post("/add/:id", catchErrors(storeController.updateStore));
//Show the existing store page
router.get("/stores/:id/edit", catchErrors(storeController.editStore));

module.exports = router;
