exports.up = function (knex) {
  return knex.schema.createTable("skills", function (table) {
    table.uuid("id").primary();
    table
      .uuid("user_id")
      .references("users.id")
      .onUpdate("CASCADE")
      .onDelete("CASCADE");
    table.string("skill_name");
    table.integer("user_level");
    table.timestamps("true", "true");
    table.integer("damage")
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("skills");
};
