(function(module) {
try { module = angular.module("endev-templates"); }
catch(err) { module = angular.module("endev-templates", []); }
module.run(["$templateCache", function($templateCache) {
  $templateCache.put("src/html/endevhelper.tpl.html", require("../../../html/endevHelper.tpl.html"));
}]);
})();
