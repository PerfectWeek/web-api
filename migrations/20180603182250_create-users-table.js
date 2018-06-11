exports.up = function(knex, Promise) {
	return knex.schema.createTable('users', (table) => {
		table.increments();
		table.string('pseudo').notNullable().unique().index(); // "index" is not useful here since we already put unique
		table.string('email').notNullable().unique();
		table.string('hashed_password').notNullable();
		table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
		table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
	});
};

exports.down = function(knex, Promise) {
	return knex.schema.dropTableIfExists('users');
};
