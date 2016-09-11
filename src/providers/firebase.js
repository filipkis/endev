var angular = require('angular');
var utils = require('./../utils');
var unwatch = require('./helpers/unwatchCache.js');
var generalDataFilter = require('./helpers/generalDataFilter.js');
var Firebase = require('firebase');

angular.module('Endev').service("$endevFirebase",['$q','$firebaseObject','$firebaseArray', function($q,$firebaseObject,$firebaseArray){
  var ref = endev && endev.firebaseProvider && endev.firebaseProvider.path ? new Firebase(endev.firebaseProvider.path) : new Firebase("https://endev.firebaseio.com");

  function getObjectRef(type,parentLabel,parentObject,parentData){
    if(parentData){
      // var key = _.findKey(parentData,function(value){return value == parentObject}) 
      var key = parentObject.$id
      var path = parentLabel ? key + "/" + type.substring(parentLabel.length + 1) : key ;
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

  function filterData(data,attrs){
    var results = generalDataFilter(data,attrs);

    results.$endevProviderType = "firebase";
    results.$ref = data.$ref()

    return results;
  }

  var unwatchCache = new unwatch();

  return {
    query: function(attrs,extraAttrs,callback) {
      var result = $q.defer();
      var from = attrs.from.slice(attrs.from.indexOf(":")+1);
      unwatchCache.unwatch(callback);
      var objRef = getObjectRef(from,attrs.parentLabel,attrs.parentObject,attrs.parentData);
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
        var updateCallback = function(){
          console.log("Data changed:", data, attrs.where);
          object = filterData(data,attrs);
          if(callback && angular.isFunction(callback)) callback(object);
          _.each(object,function(value){value.$$endevCallback = updateCallback});
        }
        _.each(object,function(value){value.$$endevCallback = updateCallback});
        unwatchCache.find(callback).unwatch = data.$watch(updateCallback);
      });

      return result.promise;
    },
    update: function(attrs) {
      var from = attrs.from.slice(attrs.from.indexOf(":")+1);
      var objRef = getObjectRef(from,attrs.parentLabel,attrs.parentObject,attrs.parentData);
      if(objRef){
        if(attrs.updatedObject.$id) {
          $firebaseObject(objRef).$loaded().then(function(parent){
            var object = $firebaseObject(parent.$ref().child(attrs.updatedObject.$id));
            utils.merge(object,attrs.updatedObject);
            object.$save();
            if(object.$$endevCallback && angular.isFunction(object.$$endevCallback)) object.$$endevCallback(object);
          });
        } else {
          $firebaseArray(objRef).$loaded().then(function(list){
            list.$add(attrs.updatedObject);
          })
        }
      }
    },
    insert: function(attrs) {
      var result = $q.defer();
      var insertInto = attrs.insertInto.slice(attrs.insertInto.indexOf(":")+1);
      var objRef = getObjectRef(insertInto,attrs.parentLabel,attrs.parentObject,attrs.parentData);

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
      var removeFrom = attrs.removeFrom.slice(attrs.removeFrom.indexOf(":")+1);
      var objRef = getObjectRef(removeFrom,attrs.parentLabel,attrs.parentObject,attrs.parentData);
      $firebaseObject(objRef).$loaded().then(function(object){
        // var key = _.findKey(object,function(value){return utils.isMatchDeep(value,attrs.newObject)})
        $firebaseObject(object.$ref().child(attrs.newObject.$id)).$remove();
      })
    },
    bind: function(attrs) {
      var from = attrs.from.slice(attrs.from.indexOf(":")+1);
      var objRef = getObjectRef(from,null,attrs.object,attrs.data);
      if(objRef) $firebaseObject(objRef).$bindTo(attrs.scope,attrs.label)
    }

  }
}]);