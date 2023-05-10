const knexConfig = require("../knexfile");
const knex = require("knex")(knexConfig["development"]);
const router = require("express").Router();
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");

router
  .post("/signup", (req, res) => {
    const { user, password } = req.body;
    const id = uuidv4();
    if (!user || !password) {
      res.status(400).send("Missing field");
    }
    const newUser = {
      id: id,
      username: user,
      password: password,
    };
    knex("users")
      .insert(newUser)
      .then((result) => {
        res.status(200).send("user added");
      })
      .catch((err) => {
        res.status(400).send(err);
      });
  })
  //get info for specific user
  .get("/:userId", (req, res) => {
    knex("users")
      .where("id", req.params.userId)
      .select("*")
      .then((result) => {
        res.status(200).send(result);
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
