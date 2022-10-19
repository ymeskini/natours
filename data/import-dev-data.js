const mongoose = require("mongoose");
const dotenv = require("dotenv");
const fs = require("fs");
const Tour = require("../models/tour");

dotenv.config();

const start = async () => {
  await mongoose.connect(process.env.DATABASE_URL);

  await Tour.deleteMany();

  const tours = fs.readFileSync(__dirname + "/tours.json", "utf-8");

  await Tour.create(JSON.parse(tours));

  await mongoose.disconnect();
};

start();
