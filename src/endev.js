	
var OPERATORS_REGEX = new RegExp(/ AND | OR  /i);
var COMPARISON_REGEX = new RegExp(/[=!><]+| (?:NOT )?LIKE | (?:NOT )?IN | IS (?:NOT )?NULL | (?:NOT )?MATCHES /);
var PATH_REGEX = new RegExp(/^(?:[a-zA-Z_$][0-9a-zA-Z_$]*\.)*(?:[a-zA-Z_$][0-9a-zA-Z_$]*)/);
var PAHT_ROOT_REGEX = new RegExp(/^[a-zA-Z_$][0-9a-zA-Z_$]*/);



var endevModule;
//checking if angularFire is loaded
try{ 
  angular.module("firebase")
  endevModule = angular.module("Endev", ["endev-templates","endev-data-tag","firebase"]);  
} catch(err) {
  endevModule = angular.module("Endev",["endev-templates","endev-data-tag"]);
}

var $injector = angular.injector(["ng","Endev"]);

_.each([['if','ng-show'],['click','ng-click']],function(pair){
  endevModule.directive(pair[0],['$compile',function($compile){
    return {
      terminal: true,
      priority: 1000,
      compile: function(element, attrs) {
        element.attr(pair[1], attrs[pair[0]]);
        element.removeAttr("data-" + pair[0]);
        return {
          pre: function preLink(scope, iElement, iAttrs, controller) {  },
          post: function postLink(scope, iElement, iAttrs, controller) {  
            $compile(iElement)(scope);
          }
        };
      }
    }
  }]);
},this);

//The basic run
endevModule.run(["$rootScope","$document","$templateCache",function($rootScope,$document,$templateCache){
  $rootScope.Date = Date;
  $rootScope.Math = Math;
  $rootScope.$endevAnnotation = false;
  $rootScope.$endevErrors = []
  if(window.endev && window.endev.logic) angular.extend($rootScope,window.endev.logic);
  angular.element($document[0].body).attr("ng-class","{'__endev_annotation_on__':$endevAnnotation}");
  angular.element($document[0].body).append($templateCache.get('endevHelper.tpl.html'));
}]);
