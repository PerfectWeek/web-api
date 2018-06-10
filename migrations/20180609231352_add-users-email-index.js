
exports.up = function(knex, Promise) {
    return knex.schema
        .alterTable('users', table => {
            table.dropIndex(['pseudo']);
        })
};

exports.down = function(knex, Promise) {
    return knex.schema.alterTable('users', table => {
        table.index(['pseudo']);
    });
};
