var pixlxml = require("pixl-xml");

module.exports = function(ngModule) {
  ngModule.service("$endevRest", function($http,$interpolate,$q){ 

    function prependTransform(defaults, transform) {
      // We can't guarantee that the transform transformation is an array
      transform = angular.isArray(transform) ? transform : [transform];
      // Append the new transformation to the defaults
      return transform.concat(defaults);
    }

    return {
      query: function(attrs) {
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
              return pixlxml.parse(data);
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
        var result = $q.defer()
        $http.get(url, config)
          .success(function(data){
            result.resolve(data);
          }).error(function(data){
            result.reject(data);
          });
        return result.promise;
      }
    }
  });
}
