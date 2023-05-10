const knexConfig = require("../knexfile");
const knex = require("knex")(knexConfig["development"]);
const router = require("express").Router();

router
  //get info for specific user
  .get("/:userId", (req, res) => {
    knex("users")
      .where("id", req.params.userId)
      .select("*")
      .then((result) => {
        res.status(200);
        res.send(result);
      });
  })
  //get skills for specific user
  .get("/skills/:userId", (req, res) => {
    knex("skills")
      .where("user_id", req.params.userId)
      .select("*")
      .then((result) => {
        res.send(result);
      });
  });

module.exports = router;
