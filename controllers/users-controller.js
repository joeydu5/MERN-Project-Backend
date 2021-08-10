const { v4: uuid } = require("uuid"); // to generate ID
const HttpError = require("../models/http-error");
const { validationResult } = require("express-validator");
const User = require("../models/user");

DUMMY_USERS = [
  {
    id: "u1",
    name: "John",
    email: "jkdxy@qq.com",
    sex: "male",
    password: "test12345",
    address: "113 Wellbank street, North Strathfield, Sydney, 2137",
    image:
      "https://images.pexels.com/photos/1680172/pexels-photo-1680172.jpeg?auto=compress&cs=tinysrgb&dpr=2&w=500",
  },
];

const getUsers = async (req, res, next) => {
  // find all the users but only return username and email, not the password'
  let users;
  try {
    users = await User.find({}, "-password"); // or 'email username', find return an array
  } catch (err) {
    const error = new HttpError("Fetching users failed", 500);
    return next(error);
  }
  res.json({ users: users.map((user) => user.toObject({ getters: true })) });
};

const signUp = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    //  res.status(422);
    return next(new HttpError("Please input valid info to update", 422));
  }
  const { username, email, password } = req.body;

  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    const error = new HttpError("Signing up failed, pls try again later.", 500);
    return next(error);
  }

  if (existingUser) {
    const error = new HttpError(
      "This emails existed, please change to another email.",
      422
    );
    return next(error);
  }

  const createdUser = new User({
    username,
    email,
    image:
      "https://images.pexels.com/photos/4330308/pexels-photo-4330308.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260",
    password, // not a saft way to store passwords
    places: [],
  });
  try {
    await createdUser.save();
  } catch (err) {
    const error = new HttpError("Creating new user failed", 500);
    return next(error);
  }

  res.status(201).json({ user: createdUser.toObject({ getters: true }) });
};

// login
const login = async (req, res, next) => {
  const { email, password } = req.body;

  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    const error = new HttpError("Login in failed, pls try again later.", 500);
    return next(error);
  }

  if (!existingUser || existingUser.password !== password) {
    const error = new HttpError(
      "Invalid password or username, please enter the correct username and password",
      401
    );
    return next(error);
  }

  res.json({
    message: "Logged In",
    user: existingUser.toObject({ getters: true }),
  });
};

exports.getUsers = getUsers;
exports.signUp = signUp;
exports.login = login;
