const jwt = require("jsonwebtoken");
const { promisify } = require("util");
const User = require("../models/user");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");

const verifyToken = promisify(jwt.verify);

const protect = catchAsync(async (req, res, next) => {
  let token = req.headers["authorization"];
  if (token && token.startsWith("Bearer")) {
    token = token.split(" ")[1];
  }

  if (!token) {
    return next(new AppError("Invalid token", 401));
  }

  const decoded = await verifyToken(token, process.env.JWT_SECRET);
  const user = await User.findById(decoded.id);

  if (!user) {
    return next(new AppError("User does not exist", 401));
  }

  if (user.changedPasswordAfter(decoded.iat)) {
    return next(new AppError("User changed password log in again", 401));
  }

  req.user = user;

  next();
});

const restrictTo =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      next(new AppError("Forbidden", 403));
    }
    next();
  };

module.exports = { protect, restrictTo };
