var angular = require('angular');

angular.module('Endev').directive("value",['$compile','$rootScope',function($compile,$rootScope){
  return {
    priority: 1000,
    terminal:true,
    compile: function(tElement,tAttributes) {
      if(tAttributes.$attr["value"]==="data-value"){
        tElement.attr("ng-model", tAttributes.value);
        tElement.removeAttr("data-value");
        if(tAttributes.value.indexOf(".") > 0) {
          var label = tAttributes.value.substr(0,tAttributes.value.indexOf(0));
          if($rootScope[label] === undefined){
            $rootScope[label] = {};
          }
        } else {
          if($rootScope[tAttributes.value] === undefined){
            $rootScope[tAttributes.value] = "";
          }
        }
      }
      return {
        pre: function preLink(scope, iElement, iAttrs, controller) {  },
        post: function postLink(scope, iElement, iAttrs, controller) {
          if(iAttrs.$attr["value"]==="data-value"){
            $compile(iElement)(scope);
          }
        }
      };
    }
  }
}]);