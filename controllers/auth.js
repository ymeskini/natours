const jwt = require("jsonwebtoken");
const User = require("../models/user");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "90d",
  });
};

exports.signup = catchAsync(async (req, res) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });

  const token = signToken(newUser._id);
  res.status(201).json({
    status: "success",
    token,
    data: {
      user: newUser,
    },
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError("Please provide email and passowrd", 400));
  }

  const userLogin = await User.findOne({ email }).select("+password");

  if (
    !userLogin ||
    !(await userLogin.correctPassword(password, userLogin.password))
  ) {
    return next(new AppError("Incorrect email or Password", 401));
  }

  const token = signToken(userLogin._id);

  res.status(200).json({
    status: "success",
    token,
  });
});
