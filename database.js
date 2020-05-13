require("dotenv").config();

const source = require("knex")({
  client: "mysql",
  connection: {
    host: process.env.DB_HOST_SOURCE,
    user: process.env.DB_USER_SOURCE,
    password: process.env.DB_PASSWORD_SOURCE,
    database: process.env.DB_NAME_SOURCE,
    charset: "utf8mb4_unicode_ci"
  }
});
const destination = require("knex")({
  client: "mysql",
  connection: {
    host: process.env.DB_HOST_DESTINATION,
    user: process.env.DB_USER_DESTINATION,
    password: process.env.DB_PASSWORD_DESTINATION,
    database: process.env.DB_NAME_DESTINATION,
    charset: "utf8mb4_unicode_ci"
  }
});

module.exports = { source, destination };
