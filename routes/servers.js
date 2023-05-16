const { response } = require("express");
const knexConfig = require("../knexfile");
const knex = require("knex")(knexConfig["production"]);
const router = require("express").Router();
const axios = require("axios");
const puppeteer = require("puppeteer");
const { v4: uuidv4 } = require("uuid");
const { authorize } = require("../utils");
const jwt = require("jsonwebtoken");
const cheerio = require("cheerio");
const fs = require("fs");
const IS_PRODUCTION = true;

const getBrowser = () =>
  IS_PRODUCTION
    ? // Connect to browserless so we don't run Chrome on the same hardware in production
      puppeteer.connect({
        browserWSEndpoint: `${process.env.browserless}--window-size=1280,1024`,
      })
    : // Run the browser locally while in development
      puppeteer.launch();

function getLevel(data) {
  const html = cheerio.load(data);
  const all = html("*").toArray();
  const allNum = all.length;
  const empty = html("*:empty").toArray();
  const emptyNum = empty.length;
  console.log(emptyNum);
  let total = 0;
  if (emptyNum !== 0) {
    total = Math.round(allNum / emptyNum);
  } else {
    total = allNum;
  }
  let modifier = Math.random() * 100;
  if (modifier === 0) {
    modifier = 1;
  }
  return Math.round(total * modifier);
}

router
  .post("/", async (req, res) => {
    let id = uuidv4();
    let imgPath = `/images/${id}.png`;
    const url = req.body.url;
    const exists = await knex("servers").where({ url }).first();
    //axios call to get page info
    if (!exists) {
      axios
        .get(url)
        .then((response) => {
          const level = getLevel(response.data);
          const health = level * 10;
          const html = cheerio.load(response.data);
          const title = html("title").text();
          console.log(html);
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
              try {
                const browser = await getBrowser();
                const page = await browser.newPage();
                console.log(page);
                await page.goto(url);
                await page.screenshot({ path: `./public${imgPath}` });
                console.log("screenshot took");
              } catch (error) {
                console.log(error);
              }
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
      id = exists.id;
      imgPath = `/images/${id}.png`;
      if (!fs.existsSync(`./public/images/${id}`)) {
        try {
          const browser = await getBrowser();
          const page = await browser.newPage();
          console.log(page);
          await page.goto(url);
          await page.screenshot({ path: `./public${imgPath}` });
          console.log("screenshot took");
        } catch (error) {
          console.log(error);
        }
      }

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
          res.status(200).send(result);
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
    const serverId = req.params.serverId;
    const { damage } = req.body;
    knex("servers")
      .where("id", serverId)
      .select("*")
      .then((result) => {
        const data = result[0];
        if (data.user_id === decodedToken.id) {
          res.send("You own this server");
        } else {
          const totalDmg = data.health - damage;
          console.log(totalDmg);
          if (totalDmg > 0) {
            knex("servers")
              .where("id", req.params.serverId)
              .update({ health: totalDmg })
              .then((result) => {
                res.status(200).send("server updated");
              })
              .catch((err) => {
                console.log(err);
                res.status(400).send("update error");
              });
          } else {
            const newHealth = data.server_level * 10;
            knex("servers")
              .where("id", req.params.serverId)
              .update({ user_id: decodedToken.id, health: newHealth })
              .then((result) => {
                res.status(200).send("user updated");
              })
              .catch((err) => {
                console.log(err);
                res.status(400).send("update error");
              });
          }
        }
      });
  });

module.exports = router;
