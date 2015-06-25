var angular = require("angular");
var _ = require("underscore");


//checking if angularFire is loaded
try{ 
  angular.module("firebase")
  module = window.endevModule = angular.module("Endev", ["endev-templates","endev-data-tag","firebase"]);  
} catch(err) {
  module = window.endevModule = angular.module("Endev",["endev-templates","endev-data-tag"]);
}

window.$injector = angular.injector(["ng","Endev"]);

_.each([['if','ng-show'],['click','ng-click']],function(pair){
  endevModule.directive(pair[0],['$compile',function($compile){
    return {
      terminal: true,
      priority: 1000,
      compile: function(element, attrs) {
        element.attr(pair[1], attrs[pair[0]]);
        element.removeAttr("data-" + pair[0]);
        return {
          pre: function preLink(scope, iElement, iAttrs, controller) {  },
          post: function postLink(scope, iElement, iAttrs, controller) {  
            $compile(iElement)(scope);
          }
        };
      }
    }
  }]);
},this);

//The basic run
endevModule.run(["$rootScope","$document","$templateCache",function($rootScope,$document,$templateCache){
  $rootScope.Date = Date;
  $rootScope.Math = Math;
  $rootScope.$endevAnnotation = false;
  $rootScope.$endevErrors = []
  if(window.endev && window.endev.logic) angular.extend($rootScope,window.endev.logic);
  angular.element($document[0].body).attr("ng-class","{'__endev_annotation_on__':$endevAnnotation}");
  angular.element($document[0].body).append($templateCache.get('src/html/endevhelper.tpl.html'));

//Firebase dependent features
if ($injector.has('$firebaseObject')) {
  endevModule.run(["$rootScope","$firebaseArray","$firebaseObject","$q",function($rootScope,$firebaseArray,$firebaseObject,$q) {
    $rootScope.from =  _.memoize(function(path) {
      var ref = new Firebase("https://endev.firebaseio.com");
    });

  }]);
}
}]);

angular.element(document).ready(function() {
    angular.bootstrap(document, ['Endev']);
});

require("./factories/expr")(endevModule);

if ($injector.has('$firebaseObject')) {
    require("./services/endevFirebase")(endevModule);
}
require("./services/endevProvider")(endevModule);
require("./services/endevRest")(endevModule);
require("./services/endevYql")(endevModule);

require("./directives/edit")(endevModule);
require("./directives/else")(endevModule);
require("./directives/endevAnnotation")(endevModule);
require("./directives/endevItem")(endevModule);
require("./directives/from")(endevModule);
require("./directives/import")(endevModule);
require("./directives/insertInto")(endevModule);
require("./directives/list")(endevModule);
require("./directives/new")(endevModule);
require("./directives/object")(endevModule);
require("./directives/removeFrom")(endevModule);
require("./directives/value")(endevModule);
