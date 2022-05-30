/**
 * Seed Function
 * (sails.config.bootstrap)
 *
 * A function that runs just before your Sails app gets lifted.
 * > Need more flexibility?  You can also create a hook.
 *
 * For more information on seeding your app with fake data, check out:
 * https://sailsjs.com/config/bootstrap
 */

module.exports.bootstrap = async function () {
	try {
        await UserMappingService.initConnection();
        await QueueService.initConnection();
        await SessionService.initConnection();

	} catch (error) {
		global.SESSION_REDIS = null;
        global.RABBIT_MQ_CONNECTION = null;
	}
};
