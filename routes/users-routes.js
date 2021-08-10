const express = require("express");
const router = express.Router(); //不要忘了等号和小括号
const { check } = require("express-validator");

const userController = require("../controllers/users-controller");

router.get("/", userController.getUsers);

router.post(
  "/signup",
  [
    check("username").not().isEmpty(),
    check("email")
      .normalizeEmail() // Test@test.com => test@test.com
      .isEmail(), // this one check if Email address is correct
    check("password").isLength({ min: 6 })
  ],
  userController.signUp
);

router.post("/login", userController.login);

module.exports = router; //不要忘了等号
