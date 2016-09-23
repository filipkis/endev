var angular = require('angular');
var $ = require('jquery');

var endevModule;
var modulesToLoad = [];
if(window.endevAngularModulesToLoad && angular.isArray(window.endevAngularModulesToLoad)){
  modulesToLoad = modulesToLoad.concat(window.endevAngularModulesToLoad);
}

//checking if angularFire is loaded
try{
  require('angularfire');
  endevModule = angular.module("Endev", modulesToLoad.concat("firebase"));
  require('./providers/firebase')
} catch(err) {
  endevModule = angular.module("Endev", modulesToLoad);
}

// Load factories
require('./factories/expr.js')

// Load attributes (i.e. angular directives)
require('./attributes/deleteFrom.js')
require('./attributes/describe.js')
require('./attributes/drag.js')
require('./attributes/drop.js')
require('./attributes/edit.js')
require('./attributes/else.js')
require('./attributes/enter.js')
require('./attributes/explain.js')
require('./attributes/from.js')
require('./attributes/import.js')
require('./attributes/insertInto.js')
require('./attributes/new.js')
require('./attributes/value.js')
require('./attributes/wrappers.js')

// Load providers
require('./providers/provider.js')
require('./providers/local.js')
require('./providers/yql.js')
require('./providers/rest.js')

var highlight = require('./attributes/highlight') 


//The basic run
endevModule.run(["$rootScope","$document","$templateCache","$compile",function($rootScope,$document,$templateCache,$compile){
  $rootScope.Date = Date;
  $rootScope.Math = Math;
  $rootScope.$now = function() {
    return new Date();
  }
  $rootScope.$endevAnnotation = false;
  $rootScope.$endevSelector = false;
  $rootScope.$endevErrors = [];
  if(window.endev && window.endev.logic) angular.extend($rootScope,window.endev.logic);
  angular.element($document[0].body)
    .attr("ng-class","{'__endev_annotation_on__':$endevAnnotation}")
    .append(require("./templates/annotations.html"));
  if(!(window.endev && !window.endev.showHelper)){
    $rootScope.$endevShowHelper = true;
  }
  angular.element($document[0]).on('click',function(){
    if($rootScope.$endevCurrentAnnotation){
      $rootScope.$endevCurrentAnnotation = null;
      $rootScope.$endevCurrentObject = null;
      $rootScope.$apply();
    }
  });
  $rootScope.$endevRecompileElement = function(element) {
    $compile(element)(angular.element(element).scope())
    $rootScope.$apply();
  }
  var lastelem;
  document.onmouseover = function(e){
    if($rootScope.$endevSelector){
      var event = e || window.event;
      $rootScope.$endevCurrentAnnotation = null;
      $rootScope.$endevCurrentObject = null;
      var target = event.target || event.srcElement;
      if(!$(target).hasClass('__endev__') && $(target).parents('.__endev__').length === 0){
        highlight.select(target);
        $rootScope.$apply();
      }
      event.stopPropagation();
    }
  }
}]);

module.exports = endevModule;