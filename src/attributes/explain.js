var angular = require('angular');
var utils = require('./../utils');

angular.module('Endev').directive("explain",function(){
  return {
    link: function(scope,element,attrs) {
      scope.$watch(attrs.explain,function(newValue){
        if(!_.isUndefined(newValue)){
          element[0].innerHTML = "<pre class='_endev_json_'>" + utils.syntaxHighlight(JSON.stringify(newValue, undefined, 2)) + "</pre>";
        }
      });
    }
  }
})