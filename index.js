const express = require("express");
const cors = require("cors");
const env = require("dotenv").config();
const PORT = process.env.PORT;
const knexConfig = require("./knexfile");
const knex = require("knex")(knexConfig["development"]);
const app = express();
const serversRoute = require("./routes/servers");
const usersRoute = require("./routes/users");

app.use(cors());
app.use(express.json());
console.log(PORT);

app.use("/api/servers", serversRoute);
app.use("/api/users", usersRoute);

app.listen(PORT, () => {
  console.log(`Listening on port: ${PORT}`);
});
