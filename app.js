const express = require("express");
const morgan = require("morgan");

const app = express();

const toursController = require("./controllers/tours");
const usersController = require("./controllers/users");

app
  .use(morgan("dev"))
  .use(express.json())
  .use(express.static(`${__dirname}/public`))
  .use("/api/v1/tours", toursController())
  .use("/api/v1/users", usersController());

module.exports = app;
