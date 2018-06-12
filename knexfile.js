// Update with your config settings.

module.exports = {

  development: {
    client: 'pg',
    connection: {
	    host: process.env.DB_HOST || '127.0.0.1',
	    user: 'postgres',
	    password: process.env.DB_PASSWD,
	    database:'perfect_week'
    }
  }
};
