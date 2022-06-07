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

    // sockets: {
    //     onlyAllowOrigins: ["http://localhost:4200", "http://localhost:1337"]
    // },

    JWT_SECRET_KEY: '12345678'
}

