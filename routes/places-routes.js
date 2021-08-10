const express = require("express");
const { check } = require("express-validator"); 
// check is a method or function in express-validator, or you can write const check=express-validator.check()

const placeControllers = require("../controllers/places-controller");
const router = express.Router();

router.get("/:pid", placeControllers.getPlaceById);

router.get("/user/:uid", placeControllers.getPlacesByUserId);

router.post(
  "/",
  // [ // this will return an error object
  //   check("title").not().isEmpty(),
  //   check("address").not().isEmpty,
  //   check("description").isLength({ min: 5 }),
  // ],
  placeControllers.createPlace
);
// post patch need to validate, check() is like middleware, it will run from left to right

router.patch("/:pid",
[
    check('title').not().isEmpty(),
    check('description').isLength({min:5})
],
placeControllers.updatePlace);

router.delete("/:pid", placeControllers.deletePlace);

module.exports = router;
