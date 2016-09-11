var angular = require('angular');
var jquery = require('jquery');

angular.module('Endev').directive("import",function($rootScope,$http,$compile) {
  return {
    compile:function(tElement, tAttrs) {
      angular.forEach(tAttrs.import.split(","), function(item){
        item = item.trim();
        if(item.indexOf('bower:') == 0) {
          item = item.split(":")[1].trim();
          $rootScope[item] = window[item];
        }else {
          $rootScope[item] = window[item];
        }
      });
    }
  }
});

var getGitRepo = function(url) {
  var match = url.match(/(?:https:\/\/github.com\/)([^\/]+\/[^\/]+)/)
  if(match.length > 1) {
    if(match[1].substr(-4) == '.git') {
      match[1] = match[1].substr(0,match[1].length - 4)
      return match[1];
    }
    return url.match(/(?:https:\/\/github.com\/)([^\/]+\/[^\/]+)/)[1];
  }
  return null
}

module.exports = {
  ready: function(cb){
    var importsObjects = document.querySelectorAll("[import]");
    var imports = [];

    // Callback function that will be called when
    var ready = function (libName) {
      if(imports.indexOf(libName) > -1){
        imports.splice(imports.indexOf(libName))
      }
      if (imports.length == 0) {
        cb();
      }
    };

    for (var i = 0; i < importsObjects.length; i++) {
      var values = importsObjects[i].getAttribute("import").split(",");
      for (var j = 0; j < values.length; j++) {
        if (values[j].indexOf('bower:') == 0) {
          var libName = values[j].split(":")[1].trim();
          imports.push(libName);
          jquery.get({
            url: 'https://bower.herokuapp.com/packages/search/' + libName,
            success: function (data) {
              if (angular.isArray(data) || data.length > 0) {
                var lib = data[0];
                console.log("Found lib to import:", lib.name)
                var repo = getGitRepo(lib.url);
                var baseUrl = "https://cdn.rawgit.com/" + repo + "/master/";
                jquery.get({
                  url: baseUrl + "package.json",
                  success: function (json) {
                    var main = json.main;
                    console.log('Found main', main);
                    var script = document.createElement('script');
                    script.setAttribute('type', 'text/javascript');
                    script.setAttribute('src', baseUrl + main);
                    script.onload = function () {
                      ready(libName);
                    }
                    script.onerror = function(){
                      ready(libName);
                    };
                    document.getElementsByTagName("head")[0].appendChild(script);
                  }
                });
              }
            },
            error: function (data) {
              ready(libName);
            }
          })
        }
      }
    }
    ready();
  }
}