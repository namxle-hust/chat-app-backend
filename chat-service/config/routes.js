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

    '/test-get-keys': 'TestController.testGetAllKey',

    '/test-send-message': 'TestController.testSendMessage',

    '/subscribe': 'ChatController.subscribe',

    '/generate-iwt': 'TestController.getJWT',

    '/send': 'ChatController.send',

    '/send-group': 'ChatController.sendGroup',

    '/update-message': 'ChatController.updateMessage',


    // Call service
    '/call': 'CallController.call',

    '/cancel-call': 'CallController.cancelCall',

    '/answer-call': 'CallController.answer',

    '/finish-call': 'CallController.finishCall',

    '/get-user-information': 'CallController.getUserInformation'

};
