const mongoose = require("mongoose");
const Schema = mongoose.Schema;


const placeSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  //images are not stored in db, will be slow
  image: { type: String, required: true },
  address: { type: String, required: true },
  //   location: {
  //     lat: { type: String, required: true },
  //     lng: { type: String, required: true },
  //   },
  // creator: { type: String, required: true },
  creator: { type: mongoose.Types.ObjectId, required: true, ref: "User" } // use mongoDB id.
});

module.exports = mongoose.model("Place", placeSchema);
// this is the schema/model, use it create the document

// const mongoose = require("mongoose");

// const Schema = mongoose.Schema;

// const placeSchema = new Schema({
//   title: { type: String, required: true },
//   description: { type: String, required: true },
//   image: { type: String, required: true },
//   address: { type: String, required: true },

//   creator: { type: String, required: true },
// });

// module.exports = mongoose.model("Place", placeSchema);
