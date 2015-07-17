var angular = require("angular");
require("./angular/datatag/");

angular.element(document).ready(function() {
    angular.bootstrap(document, ['Endev']);
});

module.exports = {
    app: require("./angular/endev/")
};
