var angular = require("angular");
var OPERATORS_REGEX = new RegExp(/ AND | OR  /i);

var dataModule = angular.module("endev-data-tag",[]);

require("./directives/data")(dataModule); 
