/**
**/

'use strict'

module.exports = {
	/**
	 * Generate custom error
	 * @param  {string} msg
	 * @param  {object} data
	 * @return {Error}
	 */

	customError: function (msg) {
		let error = new Error(msg)

		error.isCustomError = 1

		return error;
	},

	isCustomError: function (error) {
		error = error ? error : {}

		return error.isCustomError == 1
	},

	/**
	 * Error Response
	 * @param  {Object} res  Sails Request Object
	 * @param  {Mix} data
	 * @param  {Mix} code
	 */
	error: function (res, message, code) {
		let content = {
			status: 'error'
		}

		if (message) {
			content.message = message;
		} else {
			content.message = "Uknown Error";
		}

		code = code || 200

		return res.status(code).json(content)
	},

	/**
	 * Success Response
	 * @param  {Object} res  Sails Request Object
	 * @param  {Mix} data
	 * @param  {Mix} code
	 */
	success: function (res, message, data, code) {
		let content = {
			status: 'success'
		}

        if (data) {
            content.data = data;
        }

		if (message) {
			content.message = message
		}

		code = code || 200

		return res.status(code).json(content)
	}

}