exports.up = function (knex) {
  return knex.schema.createTable("users", function (table) {
    table.uuid("id").primary();
    table.string("username");
    table.string("password");
    table.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("users");
};
