// Update with your config settings.
const env = require("dotenv").config();
/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
module.exports = {
  production: {
    client: "mysql",
    connection: {
      host: process.env.MYSQLHOST,
      database: process.env.MYSQLDATABASE,
      user: process.env.MYSQLUSER,
      password: process.env.MYSQLPASSWORD,
      port: process.env.MYSQLPORT,
    },
    migrations: {
      tableName: "knex_migrations",
    },
  },
};
