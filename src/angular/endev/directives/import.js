var angular = require("angular");

module.exports = function(ngModule) {
  ngModule.directive("import", function($rootScope) {
    return {
      compile:function(tElement, tAttrs) {
        angular.forEach(tAttrs.import.split(","), function(item){
          item = item.trim();
          $rootScope[item] = window[item];
        });
      }
    }
  });
};
