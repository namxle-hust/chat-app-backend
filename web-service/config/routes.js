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
    '/health': 'TestController.healthCheck', 

    'POST /login': 'AuthController.login',

    'POST /register': 'AuthController.register',

    'POST /logout': 'AuthController.logout',

    'GET /users/getAll': 'UsersController.getAll',

    'GET /conversations': 'ChatController.getConversations',

    '/subscribe': 'TestController.subscribe',
    
    'GET /users/getAll': 'UsersController.getAll',

    'GET /conversation/private-chat/:user_id': 'ChatController.getPrivateChat',

    'GET /conversation/group/:group_id': 'ChatController.getGroupChat',

    'GET /users/getUser/:id' : 'UsersController.getUser',
    
    '/test': 'TestController.test',

};
