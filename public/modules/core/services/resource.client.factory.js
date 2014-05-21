'use strict';
angular.module('core')
 
   
 .config(['$httpProvider', function($httpProvider) {
    //$httpProvider.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
   // delete $httpProvider.defaults.headers.common['X-Requested-With']; // = 'XMLHttpRequest';
   // $httpProvider.defaults.useXDomain = true;
    //$httpProvider.defaults.headers.common.Authorization = "Basic " + Base64.encode("key978wing:X") ;
        
  }])

  .factory('dataResource', ['$http', '$q', '_', function($http, $q, _) {

    
     var baseUrl = 'https://byui.brainhoney.com/Admin/';
    
    function addRouteIfMissing(params) {
      var firstParam = params[0];
      if (!_.isNumber(firstParam) && !_.isString(firstParam)) {
        params.unshift('');
      }
    }
    
    function doHttp(params) {
      if (_.isEmpty(params.config)) {
        params.config = {};
      }

      if (!_.isEmpty(params.requestParams)) {
        params.config.params = params.requestParams;
      }

      if (!_.isUndefined(params.route) && !_.isEmpty(params.route.toString())) {
        params.route = '/' + params.route;
      }

      if (!_.isEmpty(params.data)) {
        params.config.data = params.data;
      }

      params.config.url = baseUrl + params.resourceUrl + params.route;
      params.config.method = params.action;
      return $http(params.config);
    }

    function resourceAction(action, resourceUrl, hasData) {
      return function() {
        var argumentsArray = _.toArray(arguments);
        addRouteIfMissing(argumentsArray);
        var argumentNames = hasData ? ['route', 'data', 'requestParams', 'config'] : ['route', 'requestParams', 'config'];
        var params = _.object(argumentNames, argumentsArray);
        params.action = action;
        params.resourceUrl = resourceUrl;
        return promiseData(doHttp(params));
      };
    }

    function promiseData(request) {
      var deferred = $q.defer();
      request.then(function(response) {
        deferred.resolve(response.data);
      }).catch(function(response) {
        deferred.reject(response);
      });
      return deferred.promise;
    }

    function newSubResource() {
      return newResource(_.toArray(arguments).join('/'));
    }

    function newResource(url) {
      var resource = _.partial(newSubResource, url);
      return _.extend(resource, {
        get: resourceAction('GET', url, false),
        delete: resourceAction('DELETE', url, false),
        head: resourceAction('HEAD', url, false),
        jsonp: resourceAction('JSONP', url, false),
        post: resourceAction('POST', url, true),
        put: resourceAction('PUT', url, true),
      });

    }


    return {
      newResource: newResource
    };


  }]);
