var angular = require("angular");
require("./angular/datatag/");
require("./angular/syntax-wrapper/");

angular.element(document).ready(function() {
    angular.bootstrap(document, ['Endev', 'syntaxWrapper']);
});

module.exports = {
    app: require("./angular/endev/")
};
