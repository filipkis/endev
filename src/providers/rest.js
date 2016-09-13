var angular = require('angular');
var utils = require('./../utils.js')
var X2JS = require("x2js");
var generalDataFilter = require('./helpers/generalDataFilter.js');

angular.module('Endev').service("$endevRest", ['$http','$interpolate','$q', function($http,$interpolate,$q){

  function prependTransform(defaults, transform) {
    // We can't guarantee that the transform transformation is an array
    transform = angular.isArray(transform) ? transform : [transform];
    // Append the new transformation to the defaults
    return transform.concat(defaults);
  }

  return {
    query: function(attrs,extra,callback) {
      var from = attrs.from.slice(attrs.from.indexOf(":")+1);
      var result = $q.defer();
      if(attrs.parentLabel) {
        var tmp = utils.valueOnPath(attrs.parentObject, from, true);
        tmp = generalDataFilter(tmp,attrs);
        if(callback && angular.isFunction(callback)) callback(tmp)
        else result.resolve(tmp);
      } else {
        var where = "";
        for(var i = 0; i<attrs.params.length; i++) {
          where += attrs.params[i].attribute + "=" + encodeURIComponent(attrs.params[i].value);
          if(i < attrs.params.length-1) {
            where += "&";
          }
        }
        var config = {
          headers: angular.isString(attrs.headers) ? angular.fromJson(attrs.headers) :
            angular.isObject(attrs.headers) ? attrs.headers : undefined,
          transformResponse: prependTransform($http.defaults.transformResponse, function(data, headersGetter) {
            if (headersGetter()['content-type']=="application/atom+xml") {
              var x2js = new X2JS();
              return x2js.xml_str2json(data);
            } else {
              return data;
            }
          })
        }
        var url = attrs.from
        if (url.indexOf('?') != -1) {
          url = url + "&" + where;
        } else {
          url = url + "?" + where;
        }

        $http.get(url, config)
          .success(function(data){
            result.resolve(data);
          }).error(function(data){
          result.reject(data);
        });
      }
      return result.promise;
    }
  }
}]);