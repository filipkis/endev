var angular = require("angular");
var _ = require("underscore");
var throws = require("throws");

var endevModule = angular.module("Endev", [
    "endev-data-tag",
    require("angularfire")
]);  

require("./runs/default")(endevModule);
require("./runs/firebase")(endevModule);
require("./factories/expr")(endevModule);
require("./services/endevFirebase")(endevModule);
require("./services/endevProvider")(endevModule);
require("./services/endevRest")(endevModule);
require("./services/endevYql")(endevModule);
require("./directives/endevAnnotation")(endevModule);
require("./directives/endevItem")(endevModule);
require("./directives/from")(endevModule);
require("./directives/insertInto")(endevModule);
require("./directives/object")(endevModule);
require("./directives/removeFrom")(endevModule);

module.exports = endevModule;
