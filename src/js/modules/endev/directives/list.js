var angular = require("angular");

module.exports = function(ngModule) {
  ngModule.directive("list", function($compile){
    return {
      terminal: true,
      priority: 1000, 
      compile: function(tElement,tAttributes) {
        tElement.parent().prepend("<span class='__endev_annotation__' ng-if='$annotation'>" + tAttributes.list + "</span>");
        tAttributes.$set("ng-class","{'__endev_list_item_annotated__':$annotation}")
        tAttributes.$set("ng-repeat",tAttributes.list);
        tElement.removeAttr("data-list");
        return {
          pre: function preLink(scope, iElement, iAttrs, controller) {  },
          post: function postLink(scope, iElement, iAttrs, controller) {  
            var element = $compile(iElement)(scope);
            scope.$watch('$annotation',function(newValue,oldValue){
              if(newValue){
                element.parent().addClass("__endev_annotated__");
                angular.element(element.parent().children()[0]).removeClass("ng-hide");
              } else {
                element.parent().removeClass("__endev_annotated__");
                angular.element(element.parent().children()[0]).addClass("ng-hide");
              }
            });
          }
        };
      }
    }
  });
};
