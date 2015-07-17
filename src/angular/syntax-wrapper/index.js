/**
 * This module provides an alternative Angular syntax that's supposed
 * to easier to learn / use. This is accomplished by thinly wrapping
 * some of the most common Angular directives, basically "renaming"
 * them.
 */
var angular = require("angular");

// Define the syntaxWrapper Angular module
var ngModule = angular.module("syntaxWrapper", []);  

// Attach the directives to our module
require("./directives/click")(ngModule);
require("./directives/edit")(ngModule);
require("./directives/else")(ngModule);
require("./directives/if")(ngModule);
require("./directives/import")(ngModule);
require("./directives/list")(ngModule);
require("./directives/new")(ngModule);
require("./directives/value")(ngModule);

// Export the module so it can be referenced by the outside world
module.exports = ngModule;
