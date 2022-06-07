/**
 * TestController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
    healthCheck: async (req, res) => {
        try {

            return res.json({ status: 'success', message: 'healthy' });

        } catch (error) {
            console.log('Error-TestController@healthCheck: ', error)
            return res.json({ status: 'error', message: 'error' });
        }
    },

    subscribe: async (req, res) => {
        if (!req.isSocket) {
			return req.badRequest();
		}
		
		// sails.sockets.join(req.socket, 'RealTime');

        // console.log(req.socket);

        console.log(req.socket.id);

        req.socket.on('disconnect', function() {
            console.log('User disconnected');
        });

		return res.ok();
    },
    

    send: async (req, res) => {
        // let id = req.body.id;
        // sails.sockets.broadcast(id, 'update', 'hello');
        let session = await SessionService.connect();

        await session.set('test', '123');

        const value = await session.get('test')

        console.log(value);
        // console.log(`redis://${process.env.REDIS_SESSION_ADDR}`)
        return res.json({ status: 'success' });
    },

    test: async (req, res) => {
        try {
            // await SessionService.removeExpiredJwtFromBlacklist();
            return res.json({ status: 'success' })
        } catch (error) {
            console.log('Test: ', error)
            return res.json({ status: 'error' })
        }
    }

};

