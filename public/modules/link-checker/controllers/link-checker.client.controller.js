'use strict';

angular.module('link-checker').controller('LinkCheckerController', ['$scope', '$http', '$q', '$window', 'Authentication', 'dlapRepository','_',
	function($scope, $http, $q, $window, Authentication, dlapRepository, _) {
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

      $scope.open = function(item) {
          window.open('https://byui.brainhoney.com/Frame/Component/CoursePlayer?enrollmentid='+item.entityid+'&itemid='+item.itemid);
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
        var regexToken = /(((ftp|https?):\/\/)[\-\w\ @:%_\+.~#?,&\/\/=]+)/g;

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
        var regexToken = /(navToItem[\(\'\-\w\'\)]+)/g;

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
        var regexToken = /(\[~\]\/[\-\w\ \%\()]+[\.\w]+)/g;

        // Iterate through any URLs in the text.
        while( (matchArray = regexToken.exec( source )) !== null )
        {
            var token = matchArray[0];
            urlArray.push( token );
        }

        return urlArray;

      };

      var getItemId = function (text) {
        var path = text.explode('/');
        console.log(path);
        return path[2];
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

    var getResourceList = function() {
      return dlapRepository.getResourceList($scope.courseid);
         
    };

    var getResource = function(courseid, path) {
      return dlapRepository.getResource(courseid, path);
      
    };

    var searchCourse =  function(query, course, start, results){
      var Results = results || [];
      var batch = {};
      var deferred = $q.defer();  
      dlapRepository.searchCourse(query, course, start).then(function(data) {
                
          var xml = data.response.results.$xml.replace('\n','');
          xml = xml.replace('\r','');
          batch = xml2json(xml, ' '); //$scope.getUrls(data.response.results.$xml);
        if (batch.result.doc !== undefined) {
          Results = Results.concat(batch.result.doc);
           deferred.resolve(searchCourse(query,course, start+25, Results));
        }
        else deferred.resolve(Results);
        });
        return deferred.promise;
    };

  $scope.query2 = function(){
    var resources = [];
    getResourceList().then(function(res) {
      resources = res.response.resources.resource;
      angular.forEach(resources, function(value, key){
        if(value.path.indexOf('Asset') < 0) {
          getResource($scope.courseid, value.path).then(function(res){
            value.html = res;
            //get external URLs
            value.urls = $scope.getUrls(value.html);
            angular.forEach(value.urls, function(uvalue, ukey) {
                    $scope.list.push({'entityid': value.entityid, 'itemid' : getItemId(value.path), 'url' : uvalue, 'type': 'ext'});
                });
            //get internal URLS
            value.internalUrls = $scope.getInternalUrls(value.arr[0].str);
                angular.forEach(value.internalUrls, function(uvalue, ukey) {
                    $scope.list.push({
                              'entityid': value.entityid, 
                              'itemid' : getItemId(value.path), 
                               
                              'url' : 'https://byui.brainhoney.com/Frame/Component/CoursePlayer?enrollmentid='+value.entityid+'&itemid='+getItemId(value.path),
                              'type': 'int'});
                });
          }, function(res) { //error
                console.log(res);
          });
          
        } else { //internal resource
            console.log('asset');
        }
        
      });
    });
    
  };

  $scope.query = function(query){
      
      $scope.list = [];
                
          searchCourse(query, $scope.courseid, 0).then(function(data) {
            $scope.urls = data;
            
            angular.forEach(data, function(value, key){
              angular.forEach(value.arr, function(arrValue, arrKey) {
                if(arrValue.undefined.name === 'dlap_html_text' || arrValue.undefined.name === 'dlap_links') {
                    value.urls = $scope.getUrls(arrValue.str);
                    value.internalUrls = $scope.getInternalUrls(arrValue.str);
                    value.resourceUrls = $scope.getResourceUrls(arrValue.str);
                }
              });
              //value.urls = $scope.getUrls(value.arr[0].str);
              angular.forEach(value.urls, function(uvalue, ukey) {
                  $scope.list.push({'entityid': value.undefined.entityid, 'itemid' : value.undefined.itemid, 'title': value.str[2].undefined, 'url' : uvalue, 'type': 'ext'});
              });
              
              //value.internalUrls = $scope.getInternalUrls(value.arr[0].str);
              angular.forEach(value.internalUrls, function(uvalue, ukey) {
                  $scope.list.push({
                            'entityid': value.undefined.entityid, 
                            'itemid' : value.undefined.itemid, 
                            'title': value.str[2].undefined, 
                            'url' : 'https://byui.brainhoney.com/Frame/Component/CoursePlayer?enrollmentid='+value.undefined.entityid+'&itemid='+value.undefined.itemid,
                            'type': 'int'});
              });

              //value.resourceUrls = $scope.getResourceUrls(value.arr[0].str);
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
             
    };
	}
]);