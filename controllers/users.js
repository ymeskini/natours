const { Router } = require("express");
const crypto = require("crypto");
const User = require("../models/user");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");
const sendMail = require("../utils/email");
const authController = require("./auth");
const { protect } = require("../middlewares/auth");

const createAndSendToken = (user, statusCode, res) => {
  const token = authController.signToken(user._id);
  const cookieOptions = {
    expires: new Date(Date.now() + 900000),
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
  };
  res.cookie("jwt", token, cookieOptions);

  user.password = undefined;

  res.status(statusCode).json({
    status: "sucess",
    token,
    data: {
      user,
    },
  });
};

exports.createAndSendToken = createAndSendToken;

const filteredObj = (obj, ...allowedField) => {
  const newObj = Object.create(null);
  Object.keys(obj).forEach((el) => {
    if (allowedField.includes(el)) {
      newObj[el] = obj[el];
    }
  });
};

module.exports = () => {
  const router = Router();

  router.patch(
    "/resetPassword/:token",
    catchAsync(async (req, res, next) => {
      const hashedToken = crypto
        .createHash("sha256")
        .update(req.params.token)
        .digest("hex");

      const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() },
      });

      if (!user) {
        return next(new AppError("Token is invalid or has expired", 400));
      }

      user.password = req.body.password;
      user.passwordConfirm = req.body.passwordConfirm;
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;

      await user.save();

      const token = authController.signToken(user.id);

      res.json({
        status: "success",
        token,
      });
    })
  );

  router.post("/signup", authController.signup);
  router.post("/login", authController.login);

  router.get(
    "/",
    catchAsync(async (req, res) => {
      const users = await User.find();
      res.status(200).json({
        status: "success",
        results: users.length,
        data: {
          users,
        },
      });
    })
  );

  router.post(
    "/forgotPassword",
    catchAsync(async (req, res, next) => {
      const foundUser = await User.findOne({ email: req.body.email });
      if (!foundUser) {
        return next(new AppError("User not found", 404));
      }

      const resetToken = foundUser.createPasswordResetToken();
      await foundUser.save({ validateBeforeSave: false });

      const resetURL = `${req.protocol}://${req.get(
        "host"
      )}/api/v1/users/resetPassword/${resetToken}`;

      try {
        await sendMail({
          email: foundUser.email,
          subject: "Reset your password",
          text: `Forgot your passsword blabla ${resetURL}`,
        });

        res.status(200).json({
          status: "success",
          message: "Token sent to email",
        });
      } catch (err) {
        foundUser.passwordResetToken = undefined;
        foundUser.passwordResetExpires = undefined;
        await foundUser.save({ validateBeforeSave: false });
        return next(new AppError("Failed to send email", 500));
      }
    })
  );

  router.patch(
    "/updateMe",
    protect,
    catchAsync(async (req, res, next) => {
      if (req.body.password || req.body.passwordConfirm) {
        return next(new AppError("Bad request", 400));
      }

      const filteredBody = filteredObj(req.body, "name", "email");

      await User.findByIdAndUpdate(req.user.id, filteredBody, {
        new: true,
        runValidators: true,
      });

      res.status(200).json({
        status: "success",
      });
    })
  );

  router.patch(
    "/updateMyPassword",
    protect,
    catchAsync(async (req, res, next) => {
      const user = await User.findById(req.user.id).select("+password");
      const correct = await user.correctPassword(
        req.body.currentPassword,
        user.password
      );
      if (!correct) {
        return next(new AppError("Your current password is wrong", 401));
      }

      user.password = req.body.password;
      user.passwordConfirm = req.body.passwordConfirm;

      await user.save();

      const token = authController.signToken(user.id);

      res.status(200).json({
        status: "success",
        token,
        data: {
          user,
        },
      });
    })
  );

  router.delete(
    "/deleteMe",
    protect,
    catchAsync(async (req, res) => {
      await User.findByIdAndUpdate(req.user.id, { active: false });

      res.status(204).json({
        status: "success",
        data: null,
      });
    })
  );

  return router;
};
