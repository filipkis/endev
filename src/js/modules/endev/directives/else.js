endevModule.directive("else",['$compile',function($compile){
  return {
    terminal: true,
    priority: 1000, 
    compile: function(tElement,tAttributes) {
      var prev = _.find(tElement.parent().children(),function(child){
        return angular.element(child).next()[0] == tElement[0]
      });
      if(prev && angular.element(prev).attr("ng-show")) {
        tAttributes.$set("ng-show","!" + angular.element(prev).attr("ng-show"));
      } else {
        console.log("data-else needs to come directly after data-if tag");
      }
      tElement.removeAttr("data-else");
      return {
        pre: function preLink(scope, iElement, iAttrs, controller) {  },
        post: function postLink(scope, iElement, iAttrs, controller) {  
          $compile(iElement)(scope);
        }
      };
    }
  }
}]);
