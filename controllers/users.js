const { Router } = require("express");

module.exports = () => {
  const router = Router();

  router.get("/", (req, res) => {});
  router.post("/", (req, res) => {});
  router.get("/:id", (req, res) => {});
  router.patch("/:id", (req, res) => {});
  router.delete("/:id", (req, res) => {});

  return router;
};
