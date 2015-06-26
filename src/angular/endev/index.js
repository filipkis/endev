var angular = require("angular");
var _ = require("underscore");
var throws = require("throws");

var firebaseEnabled = !throws(function(){
  angular.module("firebase");
});

var ngModuleDeps = ["endev-data-tag"];
if (firebaseEnabled) ngModuleDeps.push("firebase");

var endevModule = angular.module("Endev", ngModuleDeps);  

require("./runs/default")(endevModule);
if (firebaseEnabled) {
  require("./runs/default")(endevModule);
}

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
