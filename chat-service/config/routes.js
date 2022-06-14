/**
 * Route Mappings
 * (sails.config.routes)
 *
 * Your routes tell Sails what to do each time it receives a request.
 *
 * For more information on configuring custom routes, check out:
 * https://sailsjs.com/anatomy/config/routes-js
 */

module.exports.routes = {

    // '/': 'TestController.test',

    '/test-rabbitmq': 'TestController.testRabbitMQ',

    '/subscribe': 'ChatController.subscribe',

    '/generate-iwt': 'TestController.getJWT',

    '/send': 'ChatController.send',

    '/send-group': 'ChatController.sendGroup',

    '/get-messages': 'ChatController.getMessages',

    '/get-group-messages': 'ChatController.getGroupMessages'
};
