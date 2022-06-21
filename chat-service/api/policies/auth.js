"use strict";

const jwt = require("jsonwebtoken");

module.exports = async (req, res, next) => {
	try {
		let token;
		if (req.headers && req.headers.authorization) {
			let parts = req.headers.authorization.split(" ");

			if (!parts) {
				return ResponseService.error(res, "Unauthorized", 401);
			}

			if (parts.length == 2) {
				let scheme = parts[0];
				let credentials = parts[1];

				if (/^Bearer$/i.test(scheme)) {
					token = credentials;
				}
			} else {
				return ResponseService.error(
					res,
					"Format is Authorization: Bearer [token]",
					400
				);
			}
		}
		//&& req.socket.handshake._query && req.socket.handshake._query.token
		else if (
			req.socket &&
			req.socket.handshake &&
			req.socket.handshake.query &&
			req.socket.handshake.query.token
		) {
			token = req.socket.handshake.query.token;
		} else {
			return ResponseService.error(res, "Unauthorized", 401);
		}

		jwt.verify(token, sails.config.JWT_SECRET_KEY, async (err, decoded) => {
			try {
				if (err) {
					throw ResponseService.customError("Unauthorized access 1");
				}

				let ret = await SessionService.checkJwtInBlacklist(token);

				if (ret == true) {
					throw ResponseService.customError("Unauthorized access 2");
				}

				let id = decoded.data.id;

				let user = await Users.findOne({ id: id });

				if (!user) {
					await SessionService.addJwtToBlacklist(token);
					throw ResponseService.customError("Unauthorized access 3");
				}

				req.user = user;
				req.token = token;

				return next();
			} catch (error) {
				if (!ResponseService.isCustomError(error)) {
					console.log(error);
				}
				return ResponseService.error(res, 400);
			}
		});
	} catch (error) {
		if (!ResponseService.isCustomError(error)) {
			console.log(error);
		}
		return ResponseService.error(res, 400);
	}
};
