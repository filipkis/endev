endevModule.directive("edit",['$compile',function($compile){
  return {
    terminal: true,
    priority: 1000,
    compile: function(element, attrs) {
      element.attr("ng-if", "!$isDefault");
      element.removeAttr("data-edit");
      return {
        pre: function preLink(scope, iElement, iAttrs, controller) {  },
        post: function postLink(scope, iElement, iAttrs, controller) {  
          $compile(iElement)(scope);
        }
      };
    }
  }
}]);
