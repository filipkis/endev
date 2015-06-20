endevModule.directive("removeFrom", ['$interpolate','$endevProvider', function($interpolate,$endevProvider) {
  return {
    scope:true,
    link: function (scope,element,attrs) {
      var removeFrom = $interpolate(attrs.removeFrom,false,null,true)(scope)
      var provider;

      if(attrs.provider) {
        provider = $endevProvider.get(attrs.provider,removeFrom);
      } else {
        var pathRoot = removeFrom.match(PAHT_ROOT_REGEX);
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
}]);
