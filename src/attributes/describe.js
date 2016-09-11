var angular = require('angular');

angular.module('Endev').directive("describe",['$endevProvider',function($endevProvider){
  return {
    priority: 1001,
    terminal: true,
    link: function(scope,element,attrs) {
      var yql = $endevProvider.getContext("yql").provider;
      if(!_.isUndefined(attrs.describe)) {
        yql.desc(attrs.describe).then(function(desc){
          var res = {
            parameters: _.map(desc.request.select.key,function(value){return _.pick(value,"name","type","required")})
          }
          var text = desc.name
          if(desc.meta.documentationURL) {
            text = text + " <a href='" + desc.meta.documentationURL + "'>documentation</a>"
          }
          element[0].innerHTML = text + "<pre class='_endev_json_'>" + utils.syntaxHighlight(JSON.stringify(res, undefined, 2)) + "</pre>";
        });
      }
    }
  }
}])