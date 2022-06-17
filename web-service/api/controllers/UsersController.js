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

