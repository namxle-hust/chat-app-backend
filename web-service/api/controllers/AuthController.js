/**
 * AuthController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

const bcrypt = require("bcrypt");
const escape = require('escape-html');

module.exports = {
	login: async (req, res) => {
		try {
			let email = req.body.email;
			let password = req.body.password;

			let user = await Users.findOne({ email: email });

			if (!user) {
				return ResponseService.error(
					res,
					"Your account does not exist!"
				);
			}

            let result = await bcrypt.compare(escape(password), user.password)

            if (!result) {
                return ResponseService.error(res, 'Your email or password is incorrect!');
            }
            
            let token = SessionService.generateJwt({ id: user.id }, '7d');

            let data = {
                user_name: user.user_name,
                user_id: user.id,
                token: token
            }

            return ResponseService.success(res, data);

		} catch (error) {
			console.log("Error-AuthController@login: ", error);
			return ResponseService.error(res);
		}
	},


    register: async (req, res) => {
        try {
            let userName = req.body.user_name;
            let password = req.body.password;
            let email = req.body.email;

            let user = await Users.findOne({ email: email });

            if (user) {
                return ResponseService.error(res, 'Your email is already existed!');
            }

            let hashedPassword = bcrypt.hashSync(password, 10);

            await Users.create({ user_name: userName, email: email, password: hashedPassword })

            return ResponseService.success(res);

        } catch (error) {
            console.log('Error-AuthController@register: ', error);
            return ResponseService.error(res);
        }
    },


    logout: async (req, res) => {
        try {
            let token = req.token;

            await SessionService.addJwtToBlacklist(token);

            return ResponseService.success(res);
            
        } catch (error) {
            console.log('Error-AuthController@logout: ', error);
            return ResponseService.error(res);
        }
    }
};
