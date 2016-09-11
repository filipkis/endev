var angular = require('angular');
var utils = require('./../utils');

angular.module('Endev').service("$endevYql", ['$http','$q', function($http,$q){
  return {
    query: function(attrs,extra,callback) {
      var from = attrs.from.slice(attrs.from.indexOf(":")+1);
      var result = $q.defer()
      if(attrs.parentLabel){
        var tmp = utils.valueOnPath(attrs.parentObject,from,true)
        if(callback && angular.isFunction(callback)) callback(tmp)
        else result.resolve(tmp);
      }else{
        var where = attrs.where;
        for(var i = 0; i<attrs.params.length; i++) {
          where = where.replace(attrs.params[i].expression, attrs.params[i].replace("'" + attrs.params[i].value + "'"));
        }
        var query;
        if(attrs.use) {
          query = "use '" + attrs.use + "' as tmpTable; select * from tmpTable";
        } else {
          query = "select * from " + from;
        }
        if(where) query += " where " + where;
        $http.get("https://query.yahooapis.com/v1/public/yql?q="
            + encodeURIComponent(query)
            + "&diagnostics=true&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys&format=json")
          .success(function(data){
            var d = data.query.results;
            if(attrs.use && from.indexOf(".")>=0) {
              d = utils.valueOnPath(data.query.results,from,true);
            }
            console.log("Data:",d);
            result.resolve(d);
          }).error(function(data){
          result.reject(data.error);
        });
      }
      return result.promise

    },
    desc: function(table){
      var result = $q.defer();
      $http.get("https://query.yahooapis.com/v1/public/yql?q="
          + encodeURIComponent("desc " + table)
          + "&diagnostics=true&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys&format=json")
        .success(function(data){
          var d = data.query.results.table;
          result.resolve(d);
        }).error(function(data){
        result.reject(data.error);
      });
      return result.promise;
    }

  }
}]);