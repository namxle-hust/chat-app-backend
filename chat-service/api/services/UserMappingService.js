'use strict'

const redis = require("redis");

module.exports = {
    initConnection: async () => {
		try {
			let client = redis.createClient({
				url: `redis://${process.env.USER_MAPPING_ADDR}`,
			});

			client.on("error", (err) => {
				throw err;
			});

			await client.connect();

			global.USER_MAPPING_REDIS = client;
			global.USER_MAPPING_REDIS.is_alive = true;

			// console.log(global.USER_MAPPING_REDIS);
		} catch (error) {
			console.log(`Error-UserMappingService@initConnection`, error);
            throw error;
		}
	},

    save: async (id, socketServer) => {
        try {
            let client = await UserMappingService.connect();

            await client.sendCommand(['set', `id:${id}`, socketServer]);

            return true;

        } catch (error) {
            console.log(`Error-UserMappingService@save`, error);
            throw error;
        }
    },

    delete: async (id) => {
        try {
            let client = await UserMappingService.connect();

            await client.sendCommand(['del', `id:${id}`]);

            return true;

        } catch (error) {
            console.log(`Error-UserMappingService@delete`, error);
            throw error;
        }
    },

    getSocketId: async (userId) => {
        try {
            let client = await UserMappingService.connect();

            let socketId = await client.get(`id:${userId}`);

            return socketId;

        } catch (error) {
            console.log(`Error-UserMappingService@delete`, error);
            throw error;
        }
    },


    connect: async () => {
		try {
			if (!global.USER_MAPPING_REDIS) {
                console.log('Initial session connection')
				await UserMappingService.initConnection();
			}

			if (global.USER_MAPPING_REDIS && global.USER_MAPPING_REDIS.is_alive) {
				return global.USER_MAPPING_REDIS;
			}

			throw new Error("Unable to connect user mapping redis");
		} catch (error) {
			console.log(`Error-UserMappingService@connect`, error);
			throw error;
		}
	},
}