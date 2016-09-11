var angular = require('angular');

angular.module('Endev').directive("drop",['$compile',function($compile){
  return {
    link: function (scope,element,attrs) {
      element.bind("dragover",function(ev){
        ev.dataTransfer.effectAllowed = "move";
        ev.preventDefault();
        return false;
      })
      element.bind("drop", function(ev){
        ev.preventDefault();
        var data = JSON.parse(ev.dataTransfer.getData('text'));
        var canDrop = attrs.canDrop ? scope.$eval(attrs.canDrop,{source:data,target:scope}) : true;
        if(canDrop) {
          scope.$eval(attrs.drop,{source:data,target:scope});
          scope.$apply();
        }
      })
    }
  }
}]);