/**
 * This module provides access to backend data via angular services
 * and directives.
 */
var angular = require("angular");

// Define the "Endev" Angular module
var ngModule = angular.module("Endev", [
    require("angularfire")
]);  

// Attach the services, factories, directives etc. to our module
require("./runs/default")(ngModule);
require("./runs/firebase")(ngModule);
require("./factories/expr")(ngModule);
require("./services/endevFirebase")(ngModule);
require("./services/endevProvider")(ngModule);
require("./services/endevRest")(ngModule);
require("./services/endevYql")(ngModule);
require("./directives/data")(ngModule);
require("./directives/endevAnnotation")(ngModule);
require("./directives/endevItem")(ngModule);
require("./directives/from")(ngModule);
require("./directives/insertInto")(ngModule);
require("./directives/object")(ngModule);
require("./directives/removeFrom")(ngModule);

// Export the module so it can be referenced by the outside world
module.exports = ngModule;
