endevModule.directive("value",['$compile',function($compile){
  return {
    priority: 1000, 
    terminal:true,
    compile: function(tElement,tAttributes) {
      if(tAttributes.$attr["value"]==="data-value"){
        tElement.attr("ng-model", tAttributes.value);
        tElement.removeAttr("data-value");
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
