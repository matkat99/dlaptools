'use strict';

//Setting up route
angular.module('link-checker').config(['$stateProvider',
	function($stateProvider) {
		// Link checker state routing
		$stateProvider.
		state('link-checker', {
			url: '/link-checker',
			templateUrl: 'modules/link-checker/views/link-checker.client.view.html'
		});
	}
]);