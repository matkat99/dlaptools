'use strict';
var adobeConnect = require('../../app/controllers/adobe-connect');

module.exports = function(app) {
	// Routing logic   
	app.route('/adobe-connect/').get(adobeConnect.list);

	
};