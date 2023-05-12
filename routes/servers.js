const { response } = require("express");
const knexConfig = require("../knexfile");
const knex = require("knex")(knexConfig["development"]);
const router = require("express").Router();
const axios = require("axios");
const puppeteer = require("puppeteer");
const { v4: uuidv4 } = require("uuid");
const { authorize } = require("../utils");
const jwt = require("jsonwebtoken");
const cheerio = require("cheerio");

router
  .post("/", async (req, res) => {
    id = uuidv4();
    const imgPath = `/images/${id}.png`;
    const url = req.body.url;
    const exists = await knex("servers").where({ url }).first();
    //axios call to get page info

    if (!exists) {
      axios
        .get(url)
        .then((response) => {
          const level = Math.round(response.data.length / 1000);
          const health = level * 10;
          const html = cheerio.load(response.data);
          const title = html("title").text();
          //inserting into database
          knex("servers")
            .insert({
              id: id,
              user_id: null,
              url: url,
              image_url: imgPath,
              server_level: level,
              health: health,
              server_name: title,
            })
            .then(async (result) => {
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
                  await page.screenshot({ path: `./public${imgPath}` });
                  await browser.close();
                });
              const server = await knex("servers").where({ id }).first();
              res.status(200).send(server);
            })
            .catch((err) => {
              res.status(err.response.status).send(err);
            });
        })
        .catch((err) => {
          res.status(err.response.status).send(err);
        });
    } else {
      res.status(200).send(exists);
    }
  })
  //getting servers based on a user id
  .get("/", async (req, res) => {
    decodedToken = authorize(req.headers.authorization);
    knex("servers")
      .where("user_id", decodedToken.id)
      .select("*")
      .then((query) => {
        res.send(query);
      });
  })
  .get("/:serverId", (req, res) => {
    const id = req.params.serverId;
    knex("servers")
      .where({ id })
      .then((result) => {
        if (result.length > 0) {
          res.status(200).send({ exists: true });
        } else {
          res.status(404).send({ exists: false });
        }
      })
      .catch((err) => {
        res.status(404).send(err);
      });
  })
  //updating server with userid
  .post("/:serverId", (req, res) => {
    decodedToken = authorize(req.headers.authorization);
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
