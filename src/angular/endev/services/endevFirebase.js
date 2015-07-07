var _ = require("underscore");
var equals = require("equals");
var valueOnPath = require("value-on-path");
var Firebase = require("firebase");

module.exports = function(ngModule) {
  ngModule.service("$endevFirebase", function($q,$firebaseObject,$firebaseArray){
    var ref = ngModule.firebaseProvider && ngModule.firebaseProvider.path ? new Firebase(ngModule.firebaseProvider.path) : new Firebase("https://endev.firebaseio.com");
    
    function getObjectRef(type,parentLabel,parentObject,parentData){
      if(parentData){
        // var key = _.findKey(parentData,function(value){return value == parentObject}) 
        var key = parentObject.$id 
        path = parentLabel ? key + "/" + type.substring(parentLabel.length + 1) : key ;
        console.log("Path with parent:",path);
        return objectRef(parentData.$ref,path);
      } else {
        return objectRef(ref,type);
      }
    }

    var objectRef = function(ref,path){
      if(path) return ref.child(path.replace(".","/"));
      return null;
    };

    var unwatch = []

    var unwatchCache = function(callback){
      var result = _.find(unwatch,function(item){
        return item.callback == callback;
      });
      if(!result){
        result = {
          callback:callback
        }
        unwatch.push(result);
      }
      return result;
    };

    function filterData(data,attrs){
      var results = []
      var filter = attrs.filter;
      var inSetParams = _.filter(attrs.params,function(param) { return param.operator[0] == " IN " })
      // var results = {}
      results.$endevProviderType = "firebase";
      results.$ref = data.$ref()
      _.each(data,function(value, key){
        if(equals(value,filter)){
          // results[key] = value;
          results.push(value);
        }
      });
      _.each(inSetParams,function(param){
        results = _.filter(results,function(object){
          return _.contains(param.value,valueOnPath(object,param.lhs,true));
        })
      });
      return results;
    }

    return {
      query: function(attrs,extraAttrs,callback) {
        var result = $q.defer();

        if(unwatchCache(callback).unwatch) unwatchCache(callback).unwatch();
        var objRef = getObjectRef(attrs.from,attrs.parentLabel,attrs.parentObject,attrs.parentData);
        // TODO  need to add a watcher for the result and then update the value somehow
        $firebaseArray(objRef).$loaded().then(function(data){

          console.log("Data:",data)
          var object = filterData(data,attrs);
          // if(object.length === 0 && attrs.autoInsert) {
          //   data.$add(attrs.filter)
          // }
          object.$endevRef = objRef;
          object.$add = function(addObj){
            data.$add(addObj);
          }
          console.log("Object:",object)
          if(callback && angular.isFunction(callback)) callback(object,data);
          else result.resolve(object);
          unwatchCache(callback).unwatch = data.$watch(function(){
            console.log("Data changed:", data, attrs.where);
            object = filterData(data,attrs);               
            if(callback && angular.isFunction(callback)) callback(object);
          })
        });  

        return result.promise;
      }, 
      insert: function(attrs) {
        var result = $q.defer();

        var objRef = getObjectRef(attrs.insertInto,attrs.parentLabel,attrs.parentObject,attrs.parentData);

        $firebaseArray(objRef).$loaded().then(function(list){
          list.$add(attrs.newObject).then(function(ref){
            $firebaseArray(ref).$loaded().then(function(value){
              result.resolve(value);
            });
          });
        })
        return result.promise;
      },
      remove: function(attrs) {
        console.log("Removing:",attrs.newObject);
        var objRef = getObjectRef(attrs.removeFrom,attrs.parentLabel,attrs.parentObject,attrs.parentData);
        $firebaseObject(objRef).$loaded().then(function(object){
          $firebaseObject(object.$ref().child(attrs.newObject.$id)).$remove();
        })

      },
      bind: function(attrs) {
        var objRef = getObjectRef(attrs.from,attrs.parentLabel,attrs.parentObject,attrs.parentData);
        if(objRef) $firebaseObject(objRef).$bindTo(attrs.scope,attrs.label)
      }

    }
  });
}
