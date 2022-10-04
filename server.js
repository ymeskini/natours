const app = require("./app");
const server = require("http").createServer(app);
const dotenv = require("dotenv");
const mongoose = require("mongoose");

dotenv.config();

(async () => {
  await mongoose.connect(process.env.DATABASE_URL).then((con) => {
    console.log("DB connection successful");
  });

  server.listen(3000, () => {
    console.log("App is running on port 3000");
  });
})();
