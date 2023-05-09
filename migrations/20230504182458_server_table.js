exports.up = function (knex) {
  return knex.schema.createTable("servers", function (table) {
    table.uuid("id").primary();
    table
      .uuid("user_id")
      .references("users.id")
      .onUpdate("CASCADE")
      .onDelete("CASCADE");
    table.string("url").notNullable();
    table.string("image_url");
    table.integer("server_level");
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("servers");
};
