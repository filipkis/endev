var angular = require('angular');
var _ = require('underscore');
var utils = require('./../utils');
var unwatch = require('./helpers/unwatchCache.js');
var generalDataFilter = require('./helpers/generalDataFilter.js');

angular.module('Endev').service("$endevLocal",['$q','$window','$timeout',function($q,$window,$timeout){

  var observers = {};

  var getType = _.memoize(function(type){
    var result;
    if(utils.storageAvailable('localStorage') && localStorage.getItem(type)){
      result = JSON.parse(localStorage.getItem(type));
      //TODO what if not an object?
    } else {
      result = {};
    }
    if (_.isUndefined(result.$endevUniqId)) result.$endevUniqId = 0;
    return result;
  });

  var $watch = function(type, fn) {
    if (!observers[type]) observers[type] = [];
    observers[type].push(fn);
    return function(){
      observers[type].splice(observers[type].indexOf(fn),1);
    }
  }

  angular.element($window).on('storage',function(e){
    $timeout(function(){
      getType.cache = {};
      _.each(observers[e.key],function(fn){if(_.isFunction(fn)) fn()});
    })
  })

  var getData = function(path){
    if(path.indexOf(".")>0) {
      var type = getType(path.substring(0,path.indexOf(".")));
      return utils.valueOnPath(type,path,true);
    }
    return getType(path);
  }

  var getRefOrDefault = function(path){
    var original = getType(getTypeFromPath(path));
    if(path.indexOf(".")<0){
      return original;
    } else {
      var id = path.substring(path.lastIndexOf(".")+1);
      var parent = utils.valueOnPath(original,path.substring(0,path.lastIndexOf(".")),true);
      if(_.isUndefined(parent[id])) {
        parent[id] = {}
      }
      return parent[id];
    }
  }

  var getPath = function(from,parentObject) {
    from = from.slice(from.indexOf(":")+1);
    if (parentObject) {
      return parentObject.$$endevPath + "." + parentObject.$$endevId + "." +from.slice(from.indexOf(".")+1);
    } else {
      return from;
    }
  }

  var getTypeFromPath = function(path) {
    if(path.indexOf(".")>0)
      return path.substring(0,path.indexOf("."));
    return path;
  }

  var update = function(path, updatedItem) {
    var collection = getData(path);
    if(updatedItem.$$endevId) {
      var copy = angular.copy(updatedItem);
      _.each(_.keys(copy),function(key) { if(key.indexOf('$') == 0) delete copy[key]})
      utils.merge(collection[updatedItem.$$endevId], copy);
      save(path);
    } else {
      insert(path,updatedItem)
    }
  }

  var insert = function(path,item) {
    var collection = getRefOrDefault(path);
    var typeData = getType(getTypeFromPath(path));
    collection[++typeData.$endevUniqId] = angular.copy(item);
    save(path);
    return copyItem(item);
  }

  var remove = function(path,item){
    var collection = getData(path);
    delete collection[item.$$endevId];
    save(path);
  }

  var save = function(path){
    _.each(observers[path],function(fn){if(_.isFunction(fn)) fn()});
    if(utils.storageAvailable('localStorage')){
      var type = getTypeFromPath(path);
      localStorage.setItem(type,JSON.stringify(getType(type),function(key,value){
        if (key == '$watch') return undefined;
        return value;
      }));
    }
  }

  var copyItem = function(value,key,path) {
    var newValue;
    if(_.isObject(value) || _.isArray(value)){
      newValue = angular.copy(value);
    } else {
      newValue = {};
      newValue.$value = value;
    }
    newValue.$$endevId = key;
    newValue.$$endevPath = path;
    return newValue;
  }

  var copyCollection = function(path) {
    var data = getData(path);
    var result = [];
    _.each(data,function(value,key){
      if (key.indexOf('$')!==0) {
        result.push(copyItem(value,key,path));
      }
    })
    return result;
  }

  var unwatchCache = new unwatch();

  return {
    query:function(attrs,extraAttrs,callback){
      var result = $q.defer();
      var path = getPath(attrs.from,attrs.parentObject);
      unwatchCache.unwatch(callback);
      var data = copyCollection(path);
      var object = generalDataFilter(data,attrs);
      if(callback && angular.isFunction(callback)) callback(object,data);
      else result.resolve(object);
      unwatchCache.find(callback).unwatch = $watch(path, function(){
        var data = copyCollection(path);
        var object = generalDataFilter(data,attrs);
        if(callback && angular.isFunction(callback)) callback(object);
      });
      return result.promise;
    },
    update:function(attrs){
      update(getPath(attrs.from,attrs.parentObject), attrs.updatedObject);
    },
    insert:function(attrs){
      var result = $q.defer();
      result.resolve(insert(getPath(attrs.insertInto,attrs.parentObject),attrs.newObject));
      return result.promise;
    },
    remove:function(attrs){
      remove(getPath(attrs.removeFrom,attrs.parentObject),attrs.newObject);
    },
    bind:function(attrs){
      attrs.scope.$watch(attrs.label,function(newValue, oldValue){
        if(newValue != oldValue){
          update(getPath(attrs.from,attrs.parentObject), newValue);
        }
      },true)
    }
  }
}]);