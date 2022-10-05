const express = require("express");
const morgan = require("morgan");
const AppError = require("./utils/AppError");

const app = express();

const toursController = require("./controllers/tours");
const usersController = require("./controllers/users");
const errorHandler = require("./middlewares/errorHandler");

app
  .use(morgan("dev"))
  .use(express.json())
  .use(express.static(`${__dirname}/public`))
  .use("/api/v1/tours", toursController())
  .use("/api/v1/users", usersController())
  // should be last
  .all("*", (req, res, next) => {
    next(new AppError("Not Found", 404));
  })
  .use(errorHandler);

module.exports = app;
