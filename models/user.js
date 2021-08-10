const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true }, // unique will create a syntax so make the query faster
  password: { type: String, required: true, minlength: 6 },
  image: { type: String, required: true },
  //   places: { type: String, required: true },
  places: [{ type: mongoose.Types.ObjectId, required: true, ref: "Place" }] 
  // [ ] tells mongoose that every user can have multiple places.
});

userSchema.plugin(uniqueValidator);

module.exports = mongoose.model("User", userSchema);
