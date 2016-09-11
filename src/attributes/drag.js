var angular = require('angular');

angular.module('Endev').directive("drag",['$compile',function($compile){
  return {
    link: function (scope,element,attrs) {
      element.bind("dragstart", function(ev){
        ev.dataTransfer.setData("text/plain", JSON.stringify(scope.$eval(attrs.drag)));
        ev.dataTransfer.effectAllowed = "move";
      })
      // If can drag condition set
      if(attrs.canDrag) {
        scope.$watch(attrs.canDrag,function(newValue){
          if(newValue){ // and condition ture
            attrs.$set("draggable","true") // make it draggable
          } else {
            attrs.$set("draggable","false") // make it non-draggable
          }
        })
      } else { // make it draggable
        attrs.$set("draggable","true");
      }
    }
  }
}]);