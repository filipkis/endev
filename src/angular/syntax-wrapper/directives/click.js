module.exports = function(ngModule) {
  ngModule.directive("click", function($compile){
    return {
      terminal: true,
      priority: 1000,
      compile: function(element, attrs) {
        element.attr("ng-click", attrs["click"]);
        element.removeAttr("data-click");
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
