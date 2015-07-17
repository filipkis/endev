/**
 * This module provides access to backend data via angular services
 * and directives.
 */
var angular     = require("angular");
var angularfire = require("angularfire");

// Define the "Endev" Angular module
var ngModule = angular.module("Endev", [angularfire]);  

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

// Since the module is now attached directly to Angular, we only
// export its name.
module.exports = "Endev";
