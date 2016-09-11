var angular = require('angular');
var _ = require('underscore');

_.each([['if','ng-show'],['click','ng-click']],function(pair){
  angular.module('Endev').directive(pair[0],['$compile',function($compile){
    return {
      terminal: true,
      priority: 1000,
      compile: function(element, attrs) {
        element.attr(pair[1], attrs[pair[0]]);
        element.removeAttr("data-" + pair[0]);
        return {
          pre: function preLink(scope, iElement, iAttrs, controller) {  },
          post: function postLink(scope, iElement, iAttrs, controller) {
            $compile(iElement)(scope);
          }
        };
      }
    }
  }]);
},this);