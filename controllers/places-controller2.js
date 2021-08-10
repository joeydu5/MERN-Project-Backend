const HttpError = require("../models/http-error");
const { v4: uuid } = require("uuid"); // to generate ID
const { validationResult } = require("express-validator");
const Place = require("../models/place");

let DUMMY_PLACES = [
  {
    id: "p1",
    title: "Empire State Building",
    description: "One of the most famous sky scrapper in the world!",
    location: {
      lat: 40.7484474,
      lng: -73.9871516,
    },
    address: "20 W 34th St. NY, NY 10001",
    creator: "u1",
  },
];

const getPlaceById = (req, res, next) => {
  const placeId = req.params.pid; //{pid:'p1}
  const place = DUMMY_PLACES.find((each) => {
    return each.id === placeId;
  });

  //this is a way of handling Error
  //   if(!place){
  //      return res.status(404).json({message:'could not find a place for the provided ID'}) // if return the next json( ) will not be executed.
  //   }

  //this is another way of handling Error
  //   if(!place){
  //       const error=new Error('Could not find a place for the provided id')
  //       error.code=404;
  //       throw error;  // here
  //   }

  //this is another way of handling Error
  if (!place) {
    throw new HttpError("could not find a place for the provided id", 404);
  }

  res.json({ place }); // same as {place:place}
};

//function getPlaceById(){...}
// const getPlaceById=function(){...}

const getPlacesByUserId = (req, res, next) => {
  const userId = req.params.uid;
  const places = DUMMY_PLACES.filter((each) => each.creator === userId); //不能用find

  //this is another way of handling Error
  if (!places || places.length === 0) {
    const error = new Error("Could not find places for the provided id");
    error.code = 404;
    return next(error); // here is different
  }

  res.json({ places });
};

const createPlace = async(req, res, next) => {
  //validation:
  const errors = validationResult(req);
  if(!errors.isEmpty()){
    return next(
      new HttpError('Invalid inputs passed, please check your data', 422)
    )
  }
  // if (!errors.isEmpty()) {
  //   console.log(errors);
  //   res.status(422);
  //   throw new HttpError("Invalid inputs passed, please check your data", 422);
  // }
  //get and destructuring the data from body
  const { title, description, address, creator } = req.body;
  // Same as: const title=req.body.title;
  const createdPlace = new Place({
    title:"123456",
    description:"shangshandalaohu",
    image:
      "https://images.pexels.com/photos/783682/pexels-photo-783682.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260",
    address:"laohubuzaijia",
    creator:"u5"
  });

  try {
    await createdPlace.save(); 
    // save()  is to saving data to the DB, created an ID and return a promise, cause this step could take a while.
  } catch (err) {
    const error = new HttpError("Creating place failed, pls try again", 500)
    return next(error); 
    // this means if there is an error, will not run the code
  } 
  res.status(201).json({ place: createdPlace });
};

  // previous code without mongoose:
  // const createdPlace = {
  //   id: uuid(),
  //   title,
  //   description,
  //   location: coordinates,
  //   address,
  //   creator,
  // };
  // DUMMY_PLACES.push(createdPlace);

 

const updatePlace = (req, res, next) => {
  //validation:
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    res.status(422);
    throw new HttpError("Please input valid info to update", 422);
  }

  const { title, description } = req.body;
  const placeId = req.params.pid;
  const updatedPlace = { ...DUMMY_PLACES.find((each) => each.id === placeId) }; //use ... to create a copy of the found object, and then find it's Index.???
  const placeIndex = DUMMY_PLACES.findIndex((each) => each.id === placeId);
  updatedPlace.title = title;
  updatedPlace.description = description;
  DUMMY_PLACES[placeIndex] = updatedPlace;
  res.status(200).json({ place: updatedPlace }); // this can change a data but only store in the memory for now
};

const deletePlace = (req, res, next) => {
  const placeId = req.params.pid;
  if (!DUMMY_PLACES.find((each) => each.id === placeId)) {
    throw new HttpError("could not find a place in this ID", 404);
  }
  // const placeId = req.params.pid;
  DUMMY_PLACES = DUMMY_PLACES.filter((each) => each.id !== placeId); // return a newly array overrides the origianl array
  res.status(200).json({ message: "Deleted data" });
};

exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;
