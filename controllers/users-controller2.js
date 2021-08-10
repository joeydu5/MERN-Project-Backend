const { v4: uuid } = require("uuid"); // to generate ID
const HttpError = require("../models/http-error");
const { validationResult } = require("express-validator");

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

const getUsers = (req, res, next) => {
  res.json({ users: DUMMY_USERS });
};

const signUp = (req, res, next) => {
    //validation
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    res.status(422);
    throw new HttpError("Please input valid info to update", 422);
  }
  
  const { username, email, password } = req.body;
  const existUser = DUMMY_USERS.find((each) => each.email === email);

  if (existUser) {
    throw new HttpError(
      "Could not create if username or email already exist.",
      422
    );
  }

  const createdUser = {
    id: uuid,
    username,
    email,
    password,
  };

  DUMMY_USERS.push(createdUser);

  res.status(201).json({ user: createdUser });
};

const login = (req, res, next) => {
  const { email, password } = req.body;
  const identifiedUser = DUMMY_USERS.find((each) => each.email === email);
  if (!identifiedUser || identifiedUser.password !== password) {
    throw new HttpError("could not find a register user in our database", 401);
  }
  res.json({ message: "Logged In" });
};

exports.getUsers = getUsers;
exports.signUp = signUp;
exports.login = login;
