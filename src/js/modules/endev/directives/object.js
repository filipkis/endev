var PATH_REGEX = new RegExp(/^(?:[a-zA-Z_$][0-9a-zA-Z_$]*\.)*(?:[a-zA-Z_$][0-9a-zA-Z_$]*)/);

module.exports = function(ngModule) {
  ngModule.directive("object", function($q){
    return {
      scope: true,
      compile: function(tElement, tAttributes) {
        tElement.prepend("<span class='__endev_annotation__' ng-if='$annotation'>" + tAttributes.object + "</span>");
        return {
          pre: function preLink(scope,element,attrs) {},
          post: function postLink(scope,element,attrs) {
            attrs.$addClass("ng-hide");
            var lhs = attrs.object.split('=')[0].trim();
            var rhs = attrs.object.split('=')[1].trim();
            // var path = rhs.match(PATH_REGEX)[0];
            // if (rhs.charAt(path.length)==="(") {
            //   if (path.lastIndexOf(".") > 0) {
            //     path = path.substring(0,path.lastIndexOf("."));
            //   } else {
            //     path = null;
            //   }
            // }
            // if (path) {
            //   console.log(path)
            //   scope.$watch(path,function(newValue,oldValue){
            //     eval();
            //   });
            // }
            function eval() {
              $q.when(scope.$eval(rhs)).then(function(value){
                if(value && value["$bindTo"]) {
                  value.$bindTo(scope,lhs);
                } else {
                  scope[lhs] = value;
                }
              });
            }
            scope.$watch(lhs,function(newValue,oldValue){
              if(newValue) {
                attrs.$removeClass("ng-hide");
              } else {
                attrs.$addClass("ng-hide");
              }
            });
            scope.$watch('$annotation',function(newValue,oldValue){
              if(newValue){
                attrs.$addClass("__endev_annotated__");
              } else {
                attrs.$removeClass("__endev_annotated__");
              }
            });
            element.on("click",function(){
              console.log("Clicked object");
            });

            var unbind;
            scope.$watch(rhs,function(newValue,oldValue){
              $q.when(newValue).then(function(value){
                if(value && value["$bindTo"]) {
                  if(unbind) {
                    unbind();
                  }
                  value.$bindTo(scope,lhs).then(function(unb){
                    unbind = unb;
                  });
                } else {
                  scope[lhs] = value;
                }
              });
            });
            // eval();
          }
        }
      }
    }
  });
};
