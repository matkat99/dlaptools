'use strict';
var scripts = document.getElementsByTagName('script');
var currentScriptPath = scripts[scripts.length-1].src;
//Menu service used for managing  menus
angular.module('core')

.directive('bhLogin', ['dlapRepository', '$modal',
	function(dlapRepository, $modal) {

	return {
      restrict: 'A',
      
      template: '<div class="alert alert-info alert-dismissable" id="message" ng-if="!isLoggedIn">{{cookies}}<button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button> <span>Please login, <button ng-click="open()" class="btn btn-default">Login</button></span></div>',
      link: function(scope, element, attrs){
      		
		scope.open = function () {

		    var modalInstance = $modal.open({
		      templateUrl: currentScriptPath.replace('bhlogin.client.directive.js', 'login.html'),
		      controller: function ($scope, $modalInstance, $state, $stateParams) {
        
            $scope.ok = function () {
              
              $state.transitionTo($state.current, $stateParams, { reload: true, inherit: false, notify: true });
              $modalInstance.close(1);
            };

            $scope.cancel = function () {
              $state.transitionTo($state.current, $stateParams, { reload: true, inherit: false, notify: true });
              $modalInstance.dismiss('cancel');
            };
            
    },
		      size: 'lg',
		      resolve: {
		        items: function () {
		          return scope.items;
		        }
		      }
		    });
		};

      		var BHCookie = null;
      		dlapRepository.getCookie().then(function(data){
      			BHCookie = data.response.code;
      			console.log(BHCookie);
      		scope.cookies = BHCookie;
      		if (BHCookie === 'OK') scope.isLoggedIn = true;
      		});
      		
      		
      }
    };
}]);


