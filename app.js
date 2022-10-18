const express = require("express");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");

const AppError = require("./utils/AppError");

const app = express();

const toursController = require("./controllers/tours");
const usersController = require("./controllers/users");
const errorHandler = require("./middlewares/errorHandler");
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: "Too many requests from this IP, please try again in an hour!",
});

app
  .use(helmet())
  .use("/api", limiter)
  .use(morgan("dev"))
  .use(express.json({ limit: "10kb" }))
  .use(mongoSanitize())
  .use(xss())
  .use(
    hpp({
      whitelist: [
        "duration",
        "ratingsAverage",
        "price",
        "maxGroupSize",
        "difficulty",
        "ratingsQuantity",
      ],
    })
  )
  .use(express.static(`${__dirname}/public`))
  .use("/api/v1/tours", toursController())
  .use("/api/v1/users", usersController())
  // should be last
  .all("*", (req, res, next) => {
    next(new AppError("Not Found", 404));
  })
  .use(errorHandler);

module.exports = app;
