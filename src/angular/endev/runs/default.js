module.exports = function(ngModule) {
  ngModule.run(function($rootScope) {
    $rootScope.Date = Date;
    $rootScope.Math = Math;
    $rootScope.$endevAnnotation = false;
    $rootScope.$endevErrors = [];

    angular.element(document.body)
      .attr("ng-class","{'__endev_annotation_on__':$endevAnnotation}")
      .append(require("../templates/annotations.html"));
  });
};
