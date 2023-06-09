const express = require("express");
const cors = require("cors");
const env = require("dotenv").config();
const PORT = process.env.PORT;
const knexConfig = require("./knexfile");
const knex = require("knex")(knexConfig["production"]);
const app = express();
const serversRoute = require("./routes/servers");
const usersRoute = require("./routes/users");

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

app.use("/api/servers", serversRoute);
app.use("/api/users", usersRoute);

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Listening on port: ${PORT}`);
});
