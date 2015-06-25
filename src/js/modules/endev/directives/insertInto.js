var _ = require("underscore");
var PATH_ROOT_REGEX = new RegExp(/^[a-zA-Z_$][0-9a-zA-Z_$]*/);

module.exports = function(ngModule) {
  ngModule.directive("insertInto", function($interpolate,$endevProvider) {
    return {
      scope:true,
      link: function (scope,element,attrs) {
        var insertInto = $interpolate(attrs.insertInto,false,null,true)(scope)
        var provider;

        if(attrs.provider) {
          provider = $endevProvider.get(attrs.provider,insertInto);
        } else {
          var pathRoot = insertInto.match(PATH_ROOT_REGEX);
          if(pathRoot){
            provider = scope["$endevProvider_" + pathRoot[0]];
            if(!provider) {
              throw new Error("No self or parent provider found for:",insertInto);
            }
            parent = pathRoot[0];
          }
        }
        scope.insert = function(object) {
          console.log("Inserting:",object);

          var queryParameters = {insertInto:insertInto,newObject:object};

          if (parent) {
            queryParameters.parentLabel = parent; 
            queryParameters.parentObject = scope[parent];
            queryParameters.parentData = scope["$endevData_" + parent];
          }

          provider.insert(queryParameters).then(function(data){
            if(!_.isEqual(object,data)){
              object = data;
            }
          });
        }
      }
    }
  });
};
