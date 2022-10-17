const { Router } = require("express");
const User = require("../models/user");
const catchAsync = require("../utils/catchAsync");
const authController = require("./auth");

module.exports = () => {
  const router = Router();

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
  // router.post("/", (req, res) => {});
  // router.get("/:id", (req, res) => {});
  // router.patch("/:id", (req, res) => {});
  // router.delete("/:id", (req, res) => {});

  return router;
};
