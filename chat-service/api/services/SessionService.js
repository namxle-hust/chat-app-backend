'use strict'

const redis = require("redis");
const jwt = require('jsonwebtoken');

module.exports = {
	initConnection: async () => {
		try {
			let client = redis.createClient({
				url: `redis://${process.env.REDIS_SESSION_ADDR}`,
			});

			client.on("error", (err) => {
				throw err;
			});

			await client.connect();

			global.SESSION_REDIS = client;
			global.SESSION_REDIS.is_alive = true;

			console.log(global.SESSION_REDIS);
		} catch (error) {
			console.log(`Error-SessionService@initConnection`, error);
            throw error;
		}
	},

    /**
	* Generate JWT
	* @param  {object} data
	* @param  {string} amountTime
	* @return {string} token
	*/
	generateJwt: (data, amountTime) => {
		let secret = sails.config.JWT_SECRET_KEY;
		let token = jwt.sign({ data: data }, secret, { expiresIn: amountTime });

		return token;
	},

    /**
	* Add unwanted JWT to blacklist
	* @param  {string} token
	*/
	addJwtToBlacklist: async (token) => {
		let jwtBlackList = `jwt-blacklist:${token}`;

        try {
            let sessionRedis = await SessionService.connect();

            let rkey = await sessionRedis.get(jwtBlackList)

            if (!rkey) {
                await sessionRedis.set(jwtBlackList, token)
            }

            return true;

        } catch (error) {
            console.log('Error-SessionsService@addJwtToBlacklist: ', error);
            throw error;
        }
	},

    /**
	* Check if JWT is exist in blacklist
	* @param  {string} token
	* @return {Promise}
	*/
	checkJwtInBlacklist: async (token) => {
        let jwtBlackList = `jwt-blacklist:${token}`;

        try {
            let sessionRedis = await SessionService.connect();

            let rkey = await sessionRedis.get(jwtBlackList)

            if (rkey) {
                return true
            }

            return false;

        } catch (error) {
            console.log(`Error-SessionService@checkJwtInBlacklist: ${error}`)
            throw error;
        }
	},

    /**
	* Remove JWT expired from blacklist
	*/
	removeExpiredJwtFromBlacklist: async () => {
		let keyFormat = `jwt-blacklist:*`;

        try {
            let sessionRedis = await SessionService.connect();

            let rkeys = await sessionRedis.sendCommand(['keys', keyFormat]);

            if (!rkeys || rkeys.length == 0) {
                return true;
            }

            let removeKeys = rkeys.filter(e => {
                let jwtkey = e.replace('jwt-blacklist:', '');
                let exp = jwt.decode(jwtkey).exp;
                let time = Date.now();
                return (time >= exp * 1000)
                // return true;
            })

            // console.log(removeKeys)

            if (removeKeys.length > 0) {
                await sessionRedis.sendCommand(['del'].concat(removeKeys));
            }

            return true;
        
        } catch (error) {
            console.log(`Error-SessionService@removeExpiredJwtFromBlacklist: ${error}`)
        }
	},

	connect: async () => {
		try {
			if (!global.SESSION_REDIS) {
                console.log('Initial session connection')
				await SessionService.initConnection();
			}

			if (global.SESSION_REDIS && global.SESSION_REDIS.is_alive) {
				return global.SESSION_REDIS;
			}

			throw new Error("Unable to connect session redis");
		} catch (error) {
			console.log(`Error-SessionService@connect`, error);
			throw error;
		}
	},



};
