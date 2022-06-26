module.exports = {
    models: {
		migrate: 'safe',
		datastore: 'mysql'
	},

    datastores: {
		mysql: {
			adapter: 'sails-mysql',
			host: 'database',
			port: 3306,
			user: 'root',
			password: 'root',
			database: 'chat_app',

            // Optional
			charset: 'utf8mb4',
			collation: 'utf8mb4_general_ci',
		}
	},

    JWT_SECRET_KEY: '12345678',

    hookTimeout: 160000,
}