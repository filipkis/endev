var _ = require("underscore");
var valueOnPath = require("value-on-path");

module.exports = function(ngModule) {
  ngModule.service("$endevYql", function($http,$q){ 
    return {
      query: function(attrs,extra,callback) {
        var result = $q.defer()
        if(attrs.parentLabel){
          var tmp = valueOnPath(attrs.parentObject,attrs.from,true)
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
            query = "select * from " + attrs.from;
          }
          if(where) query += " where " + where;
          $http.get("https://query.yahooapis.com/v1/public/yql?q=" 
            + encodeURIComponent(query) 
            + "&diagnostics=true&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys&format=json")
            .success(function(data){
              var d = data.query.results;
              if(attrs.use && attrs.from.indexOf(".")>=0) {
                d = valueOnPath(data.query.results,attrs.from,true);
              }
              console.log("Data:",d);
              result.resolve(d);
            }).error(function(data){
              result.reject(data.error);
            });
        }
        return result.promise
      }
    }
  });
}
