'use strict';

//Setting up route
angular.module('adobe-connect').config(['$stateProvider',
	function($stateProvider) {
		// Adobe connect state routing
		$stateProvider.
		state('adobe-connect', {
			url: '/adobe-connect',
			templateUrl: 'modules/adobe-connect/views/adobe-connect.client.view.html'
		});
	}
]);