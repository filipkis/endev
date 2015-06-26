window.angular  = require("angular");
window._        = require("underscore");
window.firebase = require("firebase");
require("angularfire");

require("./lib/utils");
require("./angular/datatag/");
require("./angular/endev/");

angular.element(document).ready(function() {
    angular.bootstrap(document, ['Endev']);
});
