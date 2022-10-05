const express = require("express");
const morgan = require("morgan");
const AppError = require("./utils/AppError");

const app = express();

const toursController = require("./controllers/tours");
const usersController = require("./controllers/users");

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
  .use((err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || "error";

    res
      .status(err.statusCode)
      .json({ status: err.status, message: err.message });
  });

module.exports = app;
