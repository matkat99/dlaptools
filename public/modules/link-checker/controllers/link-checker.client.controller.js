'use strict';

angular.module('link-checker').controller('LinkCheckerController', ['$scope', '$http', '$q', 'Authentication', 'dlapRepository','_',
	function($scope, $http, $q, Authentication, dlapRepository, _) {
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
        $scope.list = [];
               

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

      $scope.getInternalUrls = function(text) {
        var source = (text || '').toString();
        var urlArray = [];
        var url;
        var matchArray;

        // Regular expression to find FTP, HTTP(S) and email URLs.
        var regexToken = /(navToItem\(\'[\-\w\'\)]+)/g;

        // Iterate through any URLs in the text.
        while( (matchArray = regexToken.exec( source )) !== null )
        {
            var token = matchArray[0];
            urlArray.push( token );
        }

        return urlArray;

      };

      $scope.getResourceUrls = function(text) {
        var source = (text || '').toString();
        var urlArray = [];
        var url;
        var matchArray;

        // Regular expression to find FTP, HTTP(S) and email URLs.
        var regexToken = /(\[~\]\/[\-\w]+\.[\w]+)/g;

        // Iterate through any URLs in the text.
        while( (matchArray = regexToken.exec( source )) !== null )
        {
            var token = matchArray[0];
            urlArray.push( token );
        }

        return urlArray;

      };

      $scope.checkUrls = function(){
          $scope.validated = {};
          $http.post('link-checker/check', $scope.list)
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

    var searchCourse =  function(query, course, start, results){
      var results = results || [];
      var batch = {};
      var deferred = $q.defer();  
      dlapRepository.searchCourse(query, course, start).then(function(data) {
                
          var xml = data.response.results.$xml.replace('\n','');
          xml = xml.replace('\r','');
          batch = xml2json(xml, ' '); //$scope.getUrls(data.response.results.$xml);
        if (batch.result.doc !== undefined) {
          results = results.concat(batch.result.doc);
           deferred.resolve(searchCourse(query,course, start+25, results));
        }
        else deferred.resolve(results);
        });
        return deferred.promise;
    };

  $scope.query = function(query){
      
      $scope.list = [];
      //$scope.list.external = [];
     // $scope.list.resource = [];
          
          searchCourse(query, $scope.courseid, 0).then(function(data) {
            $scope.urls = data;
            
            angular.forEach(data, function(value, key){
              value.urls = $scope.getUrls(value.arr[0].str);
              angular.forEach(value.urls, function(uvalue, ukey) {
                  $scope.list.push({'entityid': value.undefined.entityid, 'itemid' : value.undefined.itemid, 'title': value.str[2].undefined, 'url' : uvalue, 'type': 'ext'});
              });
              value.internalUrls = $scope.getInternalUrls(value.arr[0].str);
              angular.forEach(value.internalUrls, function(uvalue, ukey) {
                  $scope.list.push({
                            'entityid': value.undefined.entityid, 
                            'itemid' : value.undefined.itemid, 
                            'title': value.str[2].undefined, 
                            'url' : 'https://byui.brainhoney.com/Frame/Component/CoursePlayer?enrollmentid='+value.undefined.entityid+'&itemid='+value.undefined.itemid,
                            'type': 'int'});
              });

              value.resourceUrls = $scope.getResourceUrls(value.arr[0].str);
              angular.forEach(value.resourceUrls, function(uvalue, ukey) {
                  $scope.list.push({
                          'entityid': value.undefined.entityid, 
                          'itemid' : value.undefined.itemid,
                          'title': value.str[2].undefined, 
                          'url' : 'https://byui.brainhoney.com/Resource/'+value.undefined.entityid+'/Assets/'+uvalue.replace('[~]/', ''),
                          'type': 'res'});
              });

            });
            if($scope.list.length > 0 )
              $scope.checkUrls();
          });
                   
             // https://byui.brainhoney.com/Resource/17235627,39,5,E,2,4,2,1C3,C,1,3/Assets/acctg180_LgBanner-2.jpg
             // https://byui.brainhoney.com/Resource/17235627,39,5,E,2,4,2,1C3,C,1,3/Assets/bednar.png
             //https://byui.brainhoney.com/Resource/4398809,61/Assets/Course_Evaluations.png
    };
	}
]);