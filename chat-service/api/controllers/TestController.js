/**
 * TestController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
	healthCheck: async (req, res) => {
		try {
			return res.json({ status: "success", message: "healthy" });
		} catch (error) {
			console.log("Error-TestController@healthCheck: ", error);
			return res.json({ status: "error", message: "error" });
		}
	},

	testRabbitMQ: async (req, res) => {
		try {
            await QueueService.test();

            return res.json({ status: 'success' });

		} catch (error) {
			console.log("Error-TestController@testRabbitMQ: ", error);
			return res.json({ status: "error", message: "error" });
		}
	},

    getJWT: async (req, res) => {
        try {
            let data = req.body.data
            
            let jwt = await SessionService.generateJwt(data, '7d')

            return ResponseService.success(res, 'success', { jwt: jwt }, 200)
        } catch (error) {
            console.log(error);
            return ResponseService.error(res);
        }
    }

    
};
