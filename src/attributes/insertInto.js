var angular = require('angular');

var cleanObject = function(object) {
  if(angular.isObject(object)) {
    for(var attr in object){
      if(object[attr] == undefined) {
        object[attr] = null;
      } else {
        cleanObject(object[attr]);
      }
    }
  }
}

angular.module('Endev').directive("insertInto", ['$interpolate','$endevProvider', function($interpolate,$endevProvider) {
  return {
    scope:true,
    link: function (scope,element,attrs) {
      var insertInto = $interpolate(attrs.insertInto,false,null,true)(scope)
      var context = $endevProvider.getContext(attrs.provider,insertInto,element,scope);
      var provider = context.provider;
      var parent = context.parent;

      scope.insert = function(object) {
        console.log("Inserting:",object);

        cleanObject(object);

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