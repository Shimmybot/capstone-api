const { response } = require("express");
const knexConfig = require("../knexfile");
const knex = require("knex")(knexConfig["development"]);
const router = require("express").Router();
const axios = require("axios");
const puppeteer = require("puppeteer");
const { v4: uuidv4 } = require("uuid");

router
  .post("/", (req, res) => {
    id = uuidv4();
    const imgPath = `/public/images/${id}.png`;
    const url = req.body.url;
    //axios call to get page info
    axios.get(url).then((response) => {
      const level = Math.round(response.data.length / 1000);
      const health = level * 10;
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
      knex("servers")
        .whereNot("url", url)
        // .select("*")
        .insert({
          id: id,
          user_id: null,
          url: url,
          image_url: imgPath,
          server_level: level,
          health: health,
        })
        .then((result) => {
          console.log(result);
        });
      res.status(200);
      res.send("Successful search");
    });
  })
  .get("/:user", (req, res) => {
    knex("servers")
      .where("user_id", req.params.user)
      .select("*")
      .then((query) => {
        res.send(query);
      });
  });

module.exports = router;
