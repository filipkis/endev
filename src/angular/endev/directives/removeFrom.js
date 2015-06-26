var PATH_ROOT_REGEX = new RegExp(/^[a-zA-Z_$][0-9a-zA-Z_$]*/);

module.exports = function(ngModule) {
  ngModule.directive("removeFrom", function($interpolate,$endevProvider) {
    return {
      scope:true,
      link: function (scope,element,attrs) {
        var removeFrom = $interpolate(attrs.removeFrom,false,null,true)(scope)
        var provider;

        if(attrs.provider) {
          provider = $endevProvider.get(attrs.provider,removeFrom);
        } else {
          var pathRoot = removeFrom.match(PATH_ROOT_REGEX);
          if(pathRoot){
            provider = scope["$endevProvider_" + pathRoot[0]];
            if(!provider) {
              throw new Error("No self or parent provider found for:",removeFrom);
            }
            parent = pathRoot[0];
          }
        }
        scope.remove = function(object) {
          console.log("Removing:",object);

          var queryParameters = {removeFrom:removeFrom,newObject:object};

          if (parent) {
            queryParameters.parentLabel = parent; 
            queryParameters.parentObject = scope[parent];
            queryParameters.parentData = scope["$endevData_" + parent];
          }

          provider.remove(queryParameters)
        }
      }
    }
  });
};
