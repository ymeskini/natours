const { Router } = require("express");
const { protect, restrictTo } = require("../middlewares/auth");
const Review = require("../models/review");
const catchAsync = require("../utils/catchAsync");

const reviewController = () => {
  const router = Router();

  router.post(
    "/",
    protect,
    restrictTo("user"),
    catchAsync(async (req, res) => {
      const reviewCreated = await Review.create(req.body);
      res.status(201).json({
        status: "success",
        data: {
          review: reviewCreated,
        },
      });
    })
  );

  router.get(
    "/",
    protect,
    restrictTo("user"),
    catchAsync(async (req, res) => {
      const reviews = await Review.find();
      res.json({
        status: "success",
        results: reviews.length,
        data: {
          reviews,
        },
      });
    })
  );

  return router;
};

module.exports = reviewController;
