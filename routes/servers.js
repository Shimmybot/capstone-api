const { response } = require("express");
const knexConfig = require("../knexfile");
const knex = require("knex")(knexConfig["development"]);
const router = require("express").Router();
const axios = require("axios");
const puppeteer = require("puppeteer");
const { v4: uuidv4 } = require("uuid");
const { authorize } = require("../utils");
const jwt = require("jsonwebtoken");

router
  .post("/", (req, res) => {
    id = uuidv4();
    const imgPath = `/public/images/${id}.png`;
    const url = req.body.url;
    //axios call to get page info
    axios.get(url).then((response) => {
      const level = Math.round(response.data.length / 1000);
      const health = level * 10;

      //inserting into database
      knex("servers")
        .whereNot("url", url)
        .insert({
          id: id,
          user_id: null,
          url: url,
          image_url: imgPath,
          server_level: level,
          health: health,
        })
        .then((result) => {
          //gets screenshot of page
          puppeteer
            .launch({
              defaultViewport: {
                width: 1280,
                height: 1024,
              },
            })
            .then(async (browser) => {
              const page = await browser.newPage();
              await page.goto(url);
              await page.screenshot({ path: `.${imgPath}` });
              await browser.close();
            });
          res.status(200).send("Successful search");
        })
        .catch((err) => {
          res.send(err);
        });
    });
  })
  //getting servers based on a user id
  .get("/", async (req, res) => {
    decodedToken = authorize(req.headers.authorization, res);
    knex("servers")
      .where("user_id", decodedToken.id)
      .select("*")
      .then((query) => {
        res.send(query);
      });
  })
  //updating server with userid
  .post("/:serverId", (req, res) => {
    decodedToken = authorize(req.headers.authorization, res);
    knex("servers")
      .where("id", req.params.serverId)
      .update({ user_id: decodedToken.id })
      .then((result) => {
        res.status(200).send("user updated");
      })
      .catch((err) => {
        console.log(err);
        res.status(400).send("update error");
      });
  });

module.exports = router;
