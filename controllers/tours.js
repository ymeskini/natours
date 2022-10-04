const { Router } = require("express");
const Tour = require("../models/tour");

module.exports = () => {
  const router = Router();

  router.get("/", async (req, res) => {
    const { query } = req;
    try {
      const queryObj = { ...query };
      const excludedFields = ["page", "sort", "limit", "fields"];

      excludedFields.forEach((f) => {
        delete queryObj[f];
      });

      let queryStr = JSON.stringify(queryObj);
      queryStr = queryStr.replace(
        /\b(gte|gt|lte|lt)\b/g,
        (match) => `$${match}`
      );

      let dbQuery = Tour.find(JSON.parse(queryStr));

      if (query.sort) {
        const sortBy = query.sort.split(",").join(" ");
        dbQuery = dbQuery.sort(sortBy);
      } else {
        dbQuery = dbQuery.sort("-createdAt");
      }

      if (query.fields) {
        const fields = query.fields.split(",").join(" ");
        dbQuery = dbQuery.select(fields);
      } else {
        dbQuery = dbQuery.select("-__v");
      }

      const page = query.page * 1 || 1;
      const limit = query.limit * 1 || 100;
      const skip = (page - 1) * limit;

      dbQuery = dbQuery.skip(skip).limit(limit);

      if (query.page) {
        const numTours = await Tour.countDocuments();
        if (skip >= numTours) {
          throw new Error("This page does not exist");
        }
      }

      const tours = await dbQuery;

      res.status(200).json({
        status: "success",
        results: tours.length,
        data: {
          tours,
        },
      });
    } catch (err) {
      res.status(404).json({
        status: "fail",
        message: err,
      });
    }
  });

  router.post("/", async (req, res) => {
    try {
      const newTour = await Tour.create(req.body);
      res.status(201).json({
        status: "success",
        data: {
          tour: newTour,
        },
      });
    } catch (err) {
      res.status(404).json({
        status: "fail",
        message: "Invalid data sent",
      });
    }
  });

  router.get("/:id", async (req, res) => {
    try {
      const tour = await Tour.findById(req.params.id);
      res.status(200).json({
        status: "success",
        data: {
          tour,
        },
      });
    } catch (err) {
      res.status(404).json({
        status: "fail",
        message: err,
      });
    }
  });

  router.patch("/:id", async (req, res) => {
    try {
      const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      });
      res.status(200).json({
        status: "success",
        data: {
          tour,
        },
      });
    } catch (err) {
      res.status(404).json({
        status: "fail",
        message: err,
      });
    }
  });

  router.delete("/:id", async (req, res) => {
    try {
      await Tour.findByIdAndDelete(req.params.id);
      res.status(200).json({
        status: "success",
      });
    } catch (err) {
      res.status(404).json({
        status: "fail",
        message: err,
      });
    }
  });

  return router;
};
