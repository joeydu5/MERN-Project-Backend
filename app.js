const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const HttpError = require("./models/http-error");
const placesRoutes = require("./routes/places-routes"); // import file, it is a middleware in app.js now.
const usersRoutes = require("./routes/users-routes");
const app = express();
app.use(bodyParser.json());

//to slove the problem of the browser due to the frontend port is different with backend port
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader("Access-Control-Allow-Methods","GET,POST,PATCH,DELETE");
  // put header info on all the response to slove the problem, * means apply to any domain.
  next();
});

app.use("/api/places", placesRoutes); //  => /api/places/...
// app.use('/api/user', placesRoutes);

app.use("/api/users", usersRoutes);

app.use((req, res, next) => {
  const error = new HttpError("could not find this route", 404);
  throw error;
});

app.use((error, req, res, next) => {
  //handling error
  if (res.headerSent) {
    return next(error);
  } // if respons has been sent, then will be executed.
  res.status(error.code || 500);
  res.json({ message: error.message || "an unknown error occured!" });
});

// //connect with database first and then start the server
// mongoose
//   .connect(
//     "mongodb+srv://joeydu:test12345@cluster0.oevwe.mongodb.net/products?retryWrites=true&w=majority"
//   ) // return a promise.
//   .then(() => {
//     app.listen(5000);
//   })
//   .catch((error) => {
//     console.log(error);
//   });
//connect with database first and then start the server

mongoose
  .connect(
    "mongodb+srv://joeydu:test12345@cluster0.oevwe.mongodb.net/mern?retryWrites=true&w=majority"
  )
  .then(() => {
    app.listen(5000);
    console.log("connected to the server");
  })
  .catch((err) => {
    console.log(err);
  });
