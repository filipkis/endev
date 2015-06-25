var angular = require("angular");
var _ = require("underscore");
var throws = require("throws");

var firebaseEnabled = !throws(function(){
  angular.module("firebase");
});

var ngModuleDeps = ["endev-templates","endev-data-tag"];
if (firebaseEnabled) ngModuleDeps.push("firebase");

var endevModule = angular.module("Endev", ngModuleDeps);  

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
if (firebaseEnabled) {
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

if (firebaseEnabled) {
    require("./services/endevFirebase")(endevModule);
}
require("./services/endevProvider")(endevModule);
require("./services/endevRest")(endevModule);
require("./services/endevYql")(endevModule);

require("./directives/click")(endevModule);
require("./directives/edit")(endevModule);
require("./directives/else")(endevModule);
require("./directives/endevAnnotation")(endevModule);
require("./directives/endevItem")(endevModule);
require("./directives/from")(endevModule);
require("./directives/if")(endevModule);
require("./directives/import")(endevModule);
require("./directives/insertInto")(endevModule);
require("./directives/list")(endevModule);
require("./directives/new")(endevModule);
require("./directives/object")(endevModule);
require("./directives/removeFrom")(endevModule);
require("./directives/value")(endevModule);
