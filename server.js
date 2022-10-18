require("dotenv").config();

process.on("uncaughtException", (err) => {
  console.log("uncaughtException 🚨");
  console.error(err.name, err.message);
});

const app = require("./app");
const server = require("http").createServer(app);
const mongoose = require("mongoose");

(async () => {
  await mongoose.connect(process.env.DATABASE_URL);
  console.log("DB connection successful");

  server.listen(3000, () => {
    console.log("App is running on port 3000");
  });
})();

process.on("unhandledRejection", (err) => {
  console.log("unhandledRejection 🚨");
  console.error(err.name, err.message);
  server.close(() => {
    // eslint-disable-next-line no-process-exit
    process.exit(1);
  });
});
