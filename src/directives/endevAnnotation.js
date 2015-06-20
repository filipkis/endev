endevModule.directive("endevAnnotation",[function(){      
  return {
    // scope: {
    //   // annotation: "=endevAnnotation",
    //   // data: "=endevAnnotationData"
    // },
    link: function (scope,element,attrs) {
      element.prepend("<span class='__endev_annotation__'>" + attrs.endevAnnotation + "</span>");
      scope.$on("$endevData_" + attrs.endevAnnotation,function(event,data){

        element.append(angular.toJson(data,true));
        event.stopPropagation();
      })
      // scope.$watch("data",function(value){
      //   scope["formatedData"] = angular.toJson(value,true);
      // })
    }
  }
}]);
