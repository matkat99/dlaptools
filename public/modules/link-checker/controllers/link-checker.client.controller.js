'use strict';

angular.module('link-checker').controller('LinkCheckerController', ['$scope', '$http', 'Authentication', 'dlapRepository','_',
	function($scope, $http, Authentication, dlapRepository, _) {
		 $scope.authentication = Authentication;
		 $scope.domain = {};
        $scope.domains = [];
        $scope.course = {};
        $scope.courses = [];
        $scope.courseItems = [];
        $scope.courseManifest = {};
        $scope.courseid = null;
        $scope.audit = {};
        $scope.method = 'jsonp';
        $scope.urls = null;
        $scope.validated = [];
        //$scope.invalid = [];       

      //dlapRepository.getUser().then(function(data){
      //  $scope.dlap = data;
      //});
      dlapRepository.getDomains().then(function(data){
        $scope.domains = data.response.domains.domain;
      });

      
      $scope.getCourses = function(domain) {
        dlapRepository.getCourseList(domain).then(function(data) {
          $scope.courses = data.response.courses.course;
        });
      };

      var getCourseItems = function(course) {
        dlapRepository.getItemList(course).then(function(data) {
          $scope.courseItems = data.response;
        });
      };
      var getCourseManifest = function(course) {
        dlapRepository.getCourseManifest(course).then(function(data) {
          $scope.courseManifest = data.response.manifest;
        });
      };

      $scope.$watch('domain', function (newVal, oldval) {
      if (newVal !== oldval) {
          $scope.getCourses(newVal);
        
      }
    });
      $scope.getUrls = function(text) {
        var source = (text || '').toString();
        var urlArray = [];
        var url;
        var matchArray;

        // Regular expression to find FTP, HTTP(S) and email URLs.
        var regexToken = /(((ftp|https?):\/\/)[\-\w@:%_\+.~#?,&\/\/=]+)/g;

        // Iterate through any URLs in the text.
        while( (matchArray = regexToken.exec( source )) !== null )
        {
            var token = matchArray[0];
            urlArray.push( token );
        }

        return urlArray;

      };

      $scope.checkUrls = function(){
          $http.post('link-checker/check', $scope.urls)
        .success(function(data, status) {
            $scope.status = status;
            $scope.validated = data;
           
        })
        .error(function(data, status) {
            //$scope.invalid.push({ url: url, status: data });
            $scope.status = status;
        });
        
      };

    $scope.$watch('course', function(newVal, oldval) {
        if (newVal !== oldval) {
            //getCourseManifest(newVal);
            getCourseItems(newVal);
            dlapRepository.getItemList(newVal).then(function(data){
              $scope.courseItems = data.response.items.item;
            });
            $scope.courseid = newVal.id;
            var len = $scope.courseItems.length;
            var type = {};
            for (var i = 0; i < len; i++){
              var item = $scope.courseItems[i];
              if (typeof type[item.data.type.$value] !== 'undefined'){
                type[item.data.type.$value]++;
              }
              else{
                type[item.data.type.$value] = 0;
              }
            }
            $scope.audit.type = type;
        }
    });


    $scope.query = function(query){
      dlapRepository.searchCourse(query, $scope.courseid, 0).then(function(data) {
          var n = 0;
          $scope.urls = $scope.getUrls(data.response.results.$xml);
          
          //angular.forEach($scope.urls, function(value, key){
              $scope.checkUrls();
          //});
      });
    };
	}
]);