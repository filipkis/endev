window.angular  = require("angular");
window._        = require("underscore");
window.firebase = require("firebase");
require("angularfire");

require("./utils");
require("./xml2json");
require("./modules/datatag/data-tag");
require("./modules/endev/endev");

angular.element(document).ready(function() {
    angular.bootstrap(document, ['Endev']);
});
