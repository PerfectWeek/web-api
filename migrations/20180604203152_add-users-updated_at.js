
exports.up = function(knex, Promise) {
    return knex.schema
        // Create the function that will set the update time
        .raw(
            "CREATE OR REPLACE FUNCTION trigger_set_updated_time()\n" +
            "RETURNS TRIGGER AS $func$\n" +
            "BEGIN\n" +
            "    NEW.updated_at = NOW();\n" +
            "    RETURN NEW;\n" +
            "END;" +
            "$func$ LANGUAGE plpgsql;")
        // Call the function on UPDATE for the users table
        .raw(
            "CREATE TRIGGER user_update\n" +
            "BEFORE UPDATE ON users\n" +
            "    FOR EACH ROW EXECUTE PROCEDURE trigger_set_updated_time();"
        );
};

exports.down = function(knex, Promise) {
    return knex.schema
        .raw("DROP TRIGGER IF EXISTS user_update ON users")
        .raw("DROP FUNCTION IF EXISTS trigger_set_updated_time");
};
