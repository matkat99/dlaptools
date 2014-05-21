'use strict';
var linkChecker = require('../../app/controllers/link-checker');

module.exports = function(app) {
	// Routing logic   
	app.route('/link-checker/check').post(linkChecker.check).get(linkChecker.getResults);

	
};