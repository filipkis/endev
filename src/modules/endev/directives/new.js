endevModule.directive("new",['$compile',function($compile){
  return {
    terminal: true,
    priority: 1000,
    compile: function(element, attrs) {
      element.attr("ng-if", "$isDefault");
      element.removeAttr("data-new");
      return {
        pre: function preLink(scope, iElement, iAttrs, controller) {  },
        post: function postLink(scope, iElement, iAttrs, controller) {  
          $compile(iElement)(scope);
        }
      };
    }
  }
}]);
