const knexConfig = require("../knexfile");
const knex = require("knex")(knexConfig["development"]);
const router = require("express").Router();

router.get("/", (req, res) => {
  res.send("success");
});

module.exports = router;
