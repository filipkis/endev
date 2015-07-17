/**
 * This is the main entry point for Endev. Loosely spoken, the code
 * consists of two angular modules: "Endev" (a module that handles
 * server-side data) and "syntaxWrapper" (a module that provides an
 * alternative Angular syntax that's supposed to be asier to
 * learn / use). 
 *
 * This file loads our angular modules and bootstraps the document
 * to load Endev at startup. It also exports the Endev module as to
 * allow global access (this is setup in a browserify config) so
 * third-party directives etc. can be added at runtime.
 *
 */
var angular       = require("angular");
var syntaxWrapper = require("./angular/syntax-wrapper/");
var endev         = require("./angular/endev/");

// Bootstrap the document to load our modules at startup
angular.element(document).ready(function() {
    angular.bootstrap(document, [endev, syntaxWrapper]);
});

// Provide access to the Endev module to browserify
module.exports = {
    app: endev
};
