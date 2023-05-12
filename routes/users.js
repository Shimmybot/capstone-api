const knexConfig = require("../knexfile");
const knex = require("knex")(knexConfig["development"]);
const router = require("express").Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");
const { authorize } = require("../utils");

router
  //signup endpoint
  .post("/signup", async (req, res) => {
    const { username, password } = req.body;
    const id = uuidv4();
    if (!username || !password) {
      res.status(400).send("Missing field");
    }
    const newUser = {
      id: id,
      username: username,
      password: bcrypt.hashSync(password),
    };
    const userExists = await knex("users").where({ username }).first();

    if (!userExists) {
      knex("users")
        .insert(newUser)
        .then((result) => {
          res.status(200).send("user added");
        })
        .catch((err) => {
          res.status(400).send(err);
        });
    } else {
      res.send("User Exists");
    }
  })
  .post("/login", async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).send("Please enter the required fields");
    }

    const user = await knex("users").where({ username }).first();

    if (!user) {
      return res.status(400).send("no user with that username");
    }

    const isPasswordCorrect = bcrypt.compareSync(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(400).send("Incorrect Password");
    }

    const token = jwt.sign(
      { username: user.username, id: user.id },
      process.env.SECRET_KEY
    );
    res.json({ token });
  })
  //get info for specific user
  .get("/current", async (req, res) => {
    const decodedToken = authorize(req.headers.authorization);
    try {
      // log the decoded token to the console
      console.log(decodedToken);

      // get user using 'first'
      const user = await knex("users").where({ id: decodedToken.id }).first();

      // create a variable called 'userWithoutPassword' that is... the user without the 'password' property
      const { password, ...userWithoutPassword } = user;
      // sent to front-end
      res.json(userWithoutPassword);
    } catch (e) {
      console.log(e);
      res.status(400).json({ error: e });
    }
  })
  //get skills for specific user
  .get("/skills", async (req, res) => {
    const decodedToken = authorize(req.headers.authorization);
    try {
      // log the decoded token to the console
      console.log(decodedToken);

      // get all skills for user
      const skills = await knex("skills")
        .where({ user_id: decodedToken.id })
        .select("*");
      res.json(skills);
    } catch (e) {
      console.log(e);
      res.status(400).json({ error: e });
    }
  })
  .post("/skills", async (req, res) => {
    const decodedToken = authorize(req.headers.authorization);
    const { skill_name, skill_level, damage } = req.body;
    const hasSkill = await knex("skills").where({ skill_name }).first();
    if (!hasSkill) {
      const id = uuidv4();
      const newSkill = {
        id: id,
        user_id: decodedToken.id,
        skill_name: skill_name,
        skill_level: skill_level,
        damage: damage,
      };
      knex("skills")
        .insert(newSkill)
        .then(() => {
          res.send("sucess");
        });
    }
  });

module.exports = router;
