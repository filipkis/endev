module.exports = function(ngModule) {
  ngModule.directive("if", function($compile){
    return {
      terminal: true,
      priority: 1000,
      compile: function(element, attrs) {
        element.attr("ng-show", attrs["if"]);
        element.removeAttr("data-if");
        return {
          pre: function preLink(scope, iElement, iAttrs, controller) {  },
          post: function postLink(scope, iElement, iAttrs, controller) {  
            $compile(iElement)(scope);
          }
        };
      }
    }
  });
};
