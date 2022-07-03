/**
 * UsersController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

 const bcrypt = require("bcrypt");

module.exports = {
    getAll: async (req, res) => {
        try {

            let users = await Users.find();

            return ResponseService.success(res, users);

        } catch (error) {
            console.log('Error-UsersController@getAll: ', error);
            return ResponseService.error(res);
        }
    },

    updateUserInformation: async (req, res) => {
        try {
            let userName = req.body.user_name;
            let password = req.body.password;
            let email = req.body.emai;
            let avatarUrl = req.body.avatar_url;
            let userId = req.user.id;

            let data = {}

            let isUpdating = false;

            if (email) {
                let user = await Users.find({ email: email });
                if (user) {
                    return ResponseService.error(res, 'Email already existed!');
                }
                data.email = email;
                isUpdating = true;
            }

            if (userName) {
                data.user_name = user_name;
                isUpdating = true;
            }

            if (password) {
                data.password = bcrypt.hashSync(password, 10);
                isUpdating = true;
            }

            if (avatarUrl) {
                data.profile_pic_url = avatarUrl;
                isUpdating = true;
            }

            if (isUpdating) {
                await Users.update({ id: userId }, data);
            }

            return ResponseService.success(res);


        } catch (error) {
            console.log('Error-UsersController@updateUserInformation: ', error);
            return ResponseService.error(res);
        }
    },

    uploadUserImage: async (req, res) => {
        try {
            req.file("image").upload(
				{
					dirname: require("path").resolve(
						sails.config.appPath,
						"assets/public/users"
					),
				},
				function (err, uploadedFiles) {
					if (err) return ResponseService.error(res);

                    let file = uploadedFiles[0];

                    file.fd = file.fd.split('/home/ubuntu/service/assets/')[1]

					return ResponseService.success(res, {
                        file_path: file
                    })
				}
			);
        } catch (error) {
            console.log("Error-ChatController@upload: ", error);
			return ResponseService.error(res);
        }
    },
    
    getUser: async (req, res) => {
        try {

            let userId = req.user_id;

            let user = await Users.findOne({ id: userId });

            if (!user) {
                return ResponseService.success(res, {});
            }

            return ResponseService.success(res, user);

        } catch (error) {
            console.log('Error-UsersController@getUser: ', error);
            return ResponseService.error(res);
        }
    }

    

};

