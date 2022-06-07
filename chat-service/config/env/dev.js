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
		}
	},

    JWT_SECRET_KEY: '12345678'
}