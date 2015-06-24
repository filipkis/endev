var angular = require("angular");

window.OPERATORS_REGEX = new RegExp(/ AND | OR  /i);
window.COMPARISON_REGEX = new RegExp(/[=!><]+| (?:NOT )?LIKE | (?:NOT )?IN | IS (?:NOT )?NULL | (?:NOT )?MATCHES /);
window.PATH_REGEX = new RegExp(/^(?:[a-zA-Z_$][0-9a-zA-Z_$]*\.)*(?:[a-zA-Z_$][0-9a-zA-Z_$]*)/);
window.PAHT_ROOT_REGEX = new RegExp(/^[a-zA-Z_$][0-9a-zA-Z_$]*/);

//checking if angularFire is loaded
try{ 
  angular.module("firebase")
  window.endevModule = angular.module("Endev", ["endev-templates","endev-data-tag","firebase"]);  
} catch(err) {
  window.endevModule = angular.module("Endev",["endev-templates","endev-data-tag"]);
}

window.$injector = angular.injector(["ng","Endev"]);

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
  angular.element($document[0].body).append($templateCache.get('src/html/endevhelper.tpl.html'));

//Firebase dependent features
if ($injector.has('$firebaseObject')) {
  endevModule.run(["$rootScope","$firebaseArray","$firebaseObject","$q",function($rootScope,$firebaseArray,$firebaseObject,$q) {
    $rootScope.from =  _.memoize(function(path) {
      var ref = new Firebase("https://endev.firebaseio.com");
      // var sync = $firebase(ref.child(path),{
      //   arrayFactory: $FirebaseArray.$extendFactory({
      //     findOrNew: _.memoize(function(find,init) {
      //       var deferred = $q.defer();
      //       this.$list.$loaded().then(function(list){
      //         var result = _.findWhere(list,find);
      //         if(!result) {
      //           result = _.extend(find,init);
      //           result.$new = true;
      //         }
      //         deferred.resolve(result);
      //       });
      //       return result;
      //     },JSON.stringify),
      //     findOrCreate: _.memoize(function(find,init) {
      //       var deferred = $q.defer();
      //       this.$list.$loaded().then(function(list){
      //         var result = _.findWhere(list,find);
      //         if(!result) {
      //           list.$add(_.extend(find,init)).then(function(ref){
      //             $firebase(ref).$asObject().$loaded().then(function(object){
      //               _.extend(object,_.pick(init,function(value,key){
      //                 return !object[key] && angular.isArray(value) && value.length === 0;
      //               }));
      //               deferred.resolve(object);
      //             });
      //           });
      //         }else{
      //           var ref = new Firebase(list.$inst().$ref().toString() + "/" + result.$id);
      //           $firebase(ref).$asObject().$loaded().then(function(object){
      //             _.extend(object,_.pick(init,function(value,key){
      //               return !object[key] && angular.isArray(value) && value.length === 0;
      //             }));
      //             deferred.resolve(object);
      //           });
      //         }
      //       });
      //       return deferred.promise;
      //     },JSON.stringify),
      //     insert: function(obj) {
      //       this.$list.$add(obj);
      //     },
      //     remove: function(obj) {
      //       this.$list.$remove(obj);
      //     }
      //   }),
      //   objectFactory: $FirebaseArray.$extendFactory({
      //     findOrNew: function(find,init) {
      //       var deferred = $q.defer();
      //       this.$loaded().then(function(list){
      //         var result = _.findWhere(list,find);
      //         if(!result) {
      //           result = _.extend(find,init);
      //           result.$new = true;
      //         }
      //         deferred.resolve(result);
      //       });
      //       return result;
      //     },
      //     findOrCreate: function(find,init) {
      //       var deferred = $q.defer();
      //       this.$list.$loaded().then(function(list){
      //         var result = _.findWhere(list,find);
      //         if(!result) {
      //           list.$add(_.extend(find,init)).then(function(ref){
      //             deferred.resolve($firebase(ref).$asObject());
      //           });
      //         }else{
      //           deferred.resolve(result);
      //         }
      //       });
      //       return deferred.promise;
      //     },
      //     insert: function(obj) {
      //       this.$list.$add(obj);
      //     },
      //     remove: function(obj) {
      //       this.$list.$remove(obj);
      //     }
      //   })
      // });
      // return sync.$asArray();
      
    });

    // Array.prototype.findOrNew = _.memoize(function(find,init){     
    //   var result = _.findWhere(this,find);
    //   if(!result) {
    //     result = _.extend(find,init)
    //     result.$new = true;
    //   }
    //   return result;
    // },hasherWithThis);

    // Array.prototype.findOrCreate = _.memoize(function(find,init){
    //   var result = _.findWhere(this,find);
    //   if(!result) {
    //     result = _.extend(find,init)
    //     this.push(result);
    //   }
    //   return result;
    // },hasherWithThis);

    // Array.prototype.insert = function(obj) {
    //   obj['$new'] = undefined;
    //   obj['$deleted'] = undefined;
    //   obj['createdAt'] = new Date().getTime();
    //   this.push(obj);
    // }

    // Array.prototype.remove = function(obj) {
    //   this.splice(this.indexOf(obj),1);
    //   obj['$new'] = true;
    //   obj['$deleted'] = true;
    // }

  }]);
}
}]);

angular.element(document).ready(function() {
    angular.bootstrap(document, ['Endev']);
});

endevModule.factory("Expr", require("./factories/expr"));
require("./services/endevFirebase");
require("./services/endevProvider");
require("./services/endevRest");
require("./services/endevYql");
require("./directives/edit");
require("./directives/else");
require("./directives/endevAnnotation");
require("./directives/endevItem");
require("./directives/from");
require("./directives/import");
require("./directives/insertInto");
require("./directives/list");
require("./directives/new");
require("./directives/object");
require("./directives/removeFrom");
require("./directives/value");
