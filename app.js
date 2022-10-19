const path = require("path");
const express = require("express");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");
const cookieParser = require("cookie-parser");

const AppError = require("./utils/AppError");
const tourRouter = require("./routes/tourRoutes");
const userRouter = require("./routes/userRoutes");
const reviewRouter = require("./routes/reviewRoutes");
const viewRouter = require("./routes/viewRoutes");
const errorHandler = require("./middlewares/errorHandler");

const app = express();

const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: "Too many requests from this IP, please try again in an hour!",
});

app
  .set("view engine", "pug")
  .set("views", path.join(__dirname, "views"))
  .use(helmet())
  .use("/api", limiter)
  .use(morgan("dev"))
  .use(express.json({ limit: "10kb" }))
  .use(express.urlencoded({ extended: true, limit: "10kb" }))
  .use(cookieParser())
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
  .use(express.static(path.join(__dirname, "public")))
  .use("/", viewRouter)
  .use("/api/v1/tours", tourRouter)
  .use("/api/v1/users", userRouter)
  .use("/api/v1/reviews", reviewRouter)
  // should be last
  .all("*", (req, res, next) => {
    next(new AppError("Not Found", 404));
  })
  .use(errorHandler);

module.exports = app;
