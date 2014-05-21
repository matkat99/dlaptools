'use strict';

// Configuring the Articles module
angular.module('link-checker').run(['Menus',
	function(Menus) {
		// Set top bar menu items
		Menus.addMenuItem('topbar', 'Link Checker', 'link-checker');
		
	}
]);