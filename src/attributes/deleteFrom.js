var angular = require('angular');
var utils = require('./../utils.js');

// For backwards compatibility we support two different names
angular.forEach(['deleteFrom','removeFrom'], function(name){
  angular.module('Endev').directive(name, ['$interpolate','$endevProvider', function($interpolate,$endevProvider) {
    return {
      scope:true,
      link: function (scope,element,attrs) {
        var from = $interpolate(attrs['name'],false,null,true)(scope)
        var context = $endevProvider.getContext(attrs.provider,deleteFrom,element,scope);
        var provider = context.provider;
        var parent = context.parent;

        scope.remove = function(object) {
          utils.removeFn(from,object,parent,scope,provider)
        }
      }
    }
  }]);
});

