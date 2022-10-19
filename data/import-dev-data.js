const mongoose = require("mongoose");
const dotenv = require("dotenv");
const fs = require("fs");
const Tour = require("../models/tour");
const User = require("../models/user");
const Review = require("../models/review");

dotenv.config();

const start = async () => {
  await mongoose.connect(process.env.DATABASE_URL);

  await Tour.deleteMany();
  await Review.deleteMany();
  await User.deleteMany();

  const tours = fs.readFileSync(__dirname + "/tours.json", "utf-8");
  const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, "utf-8"));
  const reviews = JSON.parse(
    fs.readFileSync(`${__dirname}/reviews.json`, "utf-8")
  );

  await User.create(users, { validateBeforeSave: false });
  await Review.create(reviews);
  await Tour.create(JSON.parse(tours));

  await mongoose.disconnect();
};

start();
