endevModule.directive("list",['$compile',function($compile){
  return {
    terminal: true,
    priority: 1000, 
    compile: function(tElement,tAttributes) {
      tElement.parent().prepend("<span class='__endev_annotation__' ng-if='$annotation'>" + tAttributes.list + "</span>");
      tAttributes.$set("ng-class","{'__endev_list_item_annotated__':$annotation}")
      tAttributes.$set("ng-repeat",tAttributes.list);
      tElement.removeAttr("data-list");
      return {
        pre: function preLink(scope, iElement, iAttrs, controller) {  },
        post: function postLink(scope, iElement, iAttrs, controller) {  
          var element = $compile(iElement)(scope);
          scope.$watch('$annotation',function(newValue,oldValue){
            if(newValue){
              element.parent().addClass("__endev_annotated__");
              angular.element(element.parent().children()[0]).removeClass("ng-hide");
            } else {
              element.parent().removeClass("__endev_annotated__");
              angular.element(element.parent().children()[0]).addClass("ng-hide");
            }
          });
        }
      };
    }
  }
}]);

endevModule.directive("object",["$q",function($q){
  return {
    scope: true,
    compile: function(tElement, tAttributes) {
      tElement.prepend("<span class='__endev_annotation__' ng-if='$annotation'>" + tAttributes.object + "</span>");
      return {
        pre: function preLink(scope,element,attrs) {},
        post: function postLink(scope,element,attrs) {
          attrs.$addClass("ng-hide");
          var lhs = attrs.object.split('=')[0].trim();
          var rhs = attrs.object.split('=')[1].trim();
          // var path = rhs.match(PATH_REGEX)[0];
          // if (rhs.charAt(path.length)==="(") {
          //   if (path.lastIndexOf(".") > 0) {
          //     path = path.substring(0,path.lastIndexOf("."));
          //   } else {
          //     path = null;
          //   }
          // }
          // if (path) {
          //   console.log(path)
          //   scope.$watch(path,function(newValue,oldValue){
          //     eval();
          //   });
          // }
          //function eval() {
          //  $q.when(scope.$eval(rhs)).then(function(value){
          //    if(value && value["$bindTo"]) {
          //      value.$bindTo(scope,lhs);
          //    } else {
          //      scope[lhs] = value;
          //    }
          //  });
          //}
          scope.$watch(lhs,function(newValue,oldValue){
            if(newValue) {
              attrs.$removeClass("ng-hide");
            } else {
              attrs.$addClass("ng-hide");
            }
          });
          scope.$watch('$annotation',function(newValue,oldValue){
            if(newValue){
              attrs.$addClass("__endev_annotated__");
            } else {
              attrs.$removeClass("__endev_annotated__");
            }
          });
          element.on("click",function(){
            console.log("Clicked object");
          });

          var unbind;
          scope.$watch(rhs,function(newValue,oldValue){
            $q.when(newValue).then(function(value){
              if(value && value["$bindTo"]) {
                if(unbind) {
                  unbind();
                }
                value.$bindTo(scope,lhs).then(function(unb){
                  unbind = unb;
                });
              } else {
                scope[lhs] = value;
              }
            });
          });
          // eval();
        }
      }
    }
  }
}]);

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