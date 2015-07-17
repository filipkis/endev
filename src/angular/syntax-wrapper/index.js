var angular = require("angular");
var ngModule = angular.module("syntaxWrapper", []);  

require("./directives/click")(ngModule);
require("./directives/edit")(ngModule);
require("./directives/else")(ngModule);
require("./directives/if")(ngModule);
require("./directives/import")(ngModule);
require("./directives/list")(ngModule);
require("./directives/new")(ngModule);
require("./directives/value")(ngModule);

module.exports = ngModule;
