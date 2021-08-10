// const uuid = require('uuid/v4');
const mongoose = require("mongoose");
const { validationResult } = require("express-validator");
const { v4: uuid } = require("uuid");
const HttpError = require("../models/http-error");
const Place = require("../models/place");
const User = require("../models/user");


let DUMMY_PLACES = [
  {
    id: "p1",
    title: "Empire State Building",
    description: "One of the most famous sky scrapers in the world!",
    location: {
      lat: 40.7484474,
      lng: -73.9871516,
    },
    address: "20 W 34th St, New York, NY 10001",
    creator: "u1",
  },
];

// -----get place 1---------
const getPlaceById = async (req, res, next) => {
  const placeId = req.params.pid; // { pid: 'p1' }
  let place;
  try {
    // doesn't return a promise
    place = await Place.findById(placeId);
  } catch (err) {
    const error = new HttpError("sth went wrong, could not find a place", 500);
    return next(error);
  }

  // const place = DUMMY_PLACES.find((p) => {
  //   return p.id === placeId;
  // });

  if (!place) {
    const error = new HttpError(
      "Could not find a place for the provided id.",
      404
    );
    return next(error);
  }

  res.json({ place: place.toObject({ getters: true }) }); // => { place } => { place: place }. place is mongoose return object, getter:true是为了去掉前面的下划线。
};

// function getPlaceById() { ... }
// const getPlaceById = function() { ... }

// -----get place 2---------
const getPlacesByUserId = async (req, res, next) => {
  const userId = req.params.uid;

  // const places = DUMMY_PLACES.filter((p) => {
  //   return p.creator === userId;
  // });
  // in mongoDB find method return a Cursor, and then you can iterate it. but in mongoose it returns a Array direct, we can use a method to make it return a Cursor.
  let places;
  try {
    places = await Place.find({ creator: userId });
  } catch (err) {
    const error = new HttpError(
      "Fetching places failed, pls try again later",
      500
    );
    return next(error);
  }

  if (!places || places.length === 0) {
    return next(
      new HttpError("Could not find places for the provided user id.", 404)
    );
  }

  res.json({
    places: places.map((place) => place.toObject({ getters: true })),
  });
};

// -----create new place---------
const createPlace = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check your data.", 422)
    );
  }

  const { title, description, address, creator } = req.body;

  // let coordinates;
  // try {
  //   coordinates = await getCoordsForAddress(address);
  // } catch (error) {
  //   return next(error);
  // }

  // const title = req.body.title;
  const createdPlace = new Place({
    title,
    description,
    image:
      "https://images.pexels.com/photos/783682/pexels-photo-783682.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260",
    address,
    creator,
  });

  let user;
  try {
    user = await User.findById(creator);
  } catch (err) {
    const error = new HttpError("Creating place failed 2, pls try again", 500);
    return next(error);
  }
  if (!user) {
    const error = new HttpError("Could not find a user for provided ID", 404);
    return next(error);
  }
  console.log(user);

  try {
    // below code is too finish 1.save place,2. save place ID to the user ino, if one of them didn't successful, will go back to its original state.
    const sess=await mongoose.startSession();
    sess.startTransaction();
    await createdPlace.save({session:sess});
    user.places.push(createdPlace); //only add the createdPlace ID to the user.places.
    await user.save({session:sess})
    await sess.commitTransaction();

    // await createdPlace.save();
  } catch (err) {
    const error = new HttpError(
      "Creating place failed, please try again.",
      500
    );
    return next(error);
  }

  res.status(201).json({ place: createdPlace });
};

// -----update place---------
const updatePlace = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check your data.", 422)
    );
  }

  const { title, description } = req.body;
  const placeId = req.params.pid;

  let place;
  try {
    place = await Place.findById(placeId);
  } catch (err) {
    const error = new HttpError("Sth went wrong, could not update place", 500);
    return next(error);
  }
  place.title = title;
  place.description = description;

  //save the data:
  try {
    await place.save();
  } catch (err) {
    const error = new HttpError(
      "something went wrong , could not update place",
      500
    );
    return next(error);
  }

  // const updatedPlace = { ...DUMMY_PLACES.find((p) => p.id === placeId) };
  // const placeIndex = DUMMY_PLACES.findIndex((p) => p.id === placeId);
  // updatedPlace.title = title;
  // updatedPlace.description = description;
  // DUMMY_PLACES[placeIndex] = updatedPlace;

  res.status(200).json({ place: place.toObject({ getters: true }) });
};

// -----delete place---------
const deletePlace = async (req, res, next) => {
  const placeId = req.params.pid;
  let place;
  try {
    place = await Place.findById(placeId).populate('creator');
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not delete the place1",
      500
    );
    return next(error);
  }

  if(!place){
    const error=new HttpError('Could not find place for this ID', 404);
    return next(error)
  }

  try {
    const sess=await mongoose.startSession();
    sess.startTransaction();
    await place.remove({session:sess});
    place.creator.places.pull(place); // pull the opposite of push, will remove the id automatically
    await place.creator.save({session:sess});
    await sess.commitTransaction();

    // await place.remove();
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not delete the place2",
      500
    );
    return next(error);
  }

  // if (!DUMMY_PLACES.find((p) => p.id === placeId)) {
  //   throw new HttpError("Could not find a place for that id.", 404);
  // }
  // DUMMY_PLACES = DUMMY_PLACES.filter((p) => p.id !== placeId);
  res.status(200).json({ message: "Deleted place." });
};

exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;
