const { Router } = require("express");
const Tour = require("../models/tour");
const APIFeatures = require("../utils/APIFeatures");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");
const { protect, restrictTo } = require("../middlewares/auth");

module.exports = () => {
  const router = Router();

  router.get(
    "/monthly-plan/:year",
    catchAsync(async (req, res) => {
      const { year } = req.params;
      const plan = await Tour.aggregate([
        {
          $unwind: "$startDates",
        },
        {
          $match: {
            startDates: {
              $gte: new Date(`${year}-01-01`),
              $lte: new Date(`${year}-12-31`),
            },
          },
        },
        {
          $group: {
            _id: { $month: "$startDates" },
            numTourStarts: { $sum: 1 },
            tours: { $push: "$name" },
          },
        },
        {
          $addFields: {
            month: "$_id",
          },
        },
        {
          $project: {
            _id: 0,
          },
        },
        {
          $sort: {
            numTourStarts: -1,
          },
        },
        {
          $limit: 12,
        },
      ]);

      res.status(200).json({
        status: "success",
        data: {
          plan,
        },
      });
    })
  );

  router.get(
    "/tour-stats",
    catchAsync(async (req, res) => {
      const stats = await Tour.aggregate([
        {
          $match: {
            ratingsAverage: { $gte: 4.5 },
          },
        },
        {
          $group: {
            _id: { $toUpper: "$difficulty" },
            numTours: { $sum: 1 },
            numRatings: { $sum: "$ratingsQuantity" },
            avgRating: {
              $avg: "$ratingsAverage",
            },
            avgPrice: {
              $avg: "$price",
            },
            minPrice: {
              $min: "$price",
            },
            maxPrice: {
              $max: "$price",
            },
          },
        },
        {
          $sort: {
            avgPrice: 1,
          },
        },
        // it's possible to add more stages
        // {
        //   $match: { _id: { $ne: "EASY" } },
        // },
      ]);
      res.status(200).json({
        status: "success",
        data: {
          stats,
        },
      });
    })
  );

  router.get(
    "/",
    protect,
    catchAsync(async (req, res) => {
      const { query } = req;
      const features = new APIFeatures(Tour.find(), query)
        .filter()
        .sort()
        .limitFields()
        .paginate();
      const tours = await features.query;

      res.status(200).json({
        status: "success",
        results: tours.length,
        data: {
          tours,
        },
      });
    })
  );

  router.post(
    "/",
    catchAsync(async (req, res) => {
      const newTour = await Tour.create(req.body);
      res.status(201).json({
        status: "success",
        data: {
          tour: newTour,
        },
      });
    })
  );

  router.get(
    "/:id",
    catchAsync(async (req, res, next) => {
      const tour = await Tour.findById(req.params.id);

      if (!tour) {
        return next(new AppError("No tour found with that ID", 404));
      }

      res.status(200).json({
        status: "success",
        data: {
          tour,
        },
      });
    })
  );

  router.patch(
    "/:id",
    catchAsync(async (req, res, next) => {
      const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      });

      if (!tour) {
        return next(new AppError("No tour found with that ID", 404));
      }

      res.status(200).json({
        status: "success",
        data: {
          tour,
        },
      });
    })
  );

  router.delete(
    "/:id",
    protect,
    restrictTo("admin", "lead-guide"),
    catchAsync(async (req, res, next) => {
      const tour = await Tour.findByIdAndDelete(req.params.id);

      if (!tour) {
        return next(new AppError("No tour found with that ID", 404));
      }

      res.status(200).json({
        status: "success",
      });
    })
  );

  return router;
};
