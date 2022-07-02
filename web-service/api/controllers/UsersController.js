/**
 * UsersController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

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

