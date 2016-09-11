var angular = require('angular');

var PATH_ROOT_REGEX = new RegExp(/^[a-zA-Z_$][0-9a-zA-Z_$]*/);
var PROTOCOL_REGEX = new RegExp(/^([a-zA-Z_$][0-9a-zA-Z_$]*):/);

angular.module('Endev').service("$endevProvider",['$injector', function($injector){
  return {
    getContext: function(name,path,element,scope) {
      var provider, parent;
      var name = name || (path.search(/http(s)?:\/\//) == 0 ? "rest" : (path.match(PROTOCOL_REGEX) || [null,null])[1]);
      if(name) {
        provider = $injector.get('$endev' + name[0].toUpperCase() + name.slice(1));
      } else {
        var pathRoot = path.match(PATH_ROOT_REGEX);
        if(pathRoot){
          provider = scope["$endevProvider_" + pathRoot[0]];
          if(!provider) {
            provider = $injector.get('$endevLocal');
            //throw new Error("No self or parent provider found for:", path, "on:", element);
          } else {
            parent = pathRoot[0];
          }
        }
      }
      return {
        provider: provider,
        parent: parent
      }
    }
  }
}]);