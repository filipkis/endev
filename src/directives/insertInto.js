endevModule.directive("insertInto", ['$interpolate','$endevProvider', function($interpolate,$endevProvider) {
  return {
    scope:true,
    link: function (scope,element,attrs) {
      var insertInto = $interpolate(attrs.insertInto,false,null,true)(scope)
      var provider;

      if(attrs.provider) {
        provider = $endevProvider.get(attrs.provider,insertInto);
      } else {
        var pathRoot = insertInto.match(PAHT_ROOT_REGEX);
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
}]);
