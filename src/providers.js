var PATH_ROOT_REGEX = new RegExp(/^[a-zA-Z_$][0-9a-zA-Z_$]*/);
var PROTOCOL_REGEX = new RegExp(/^([a-zA-Z_$][0-9a-zA-Z_$]*):/);

var generalDataFilter = function (data, attrs) {
  var results = [];
  var filter = attrs.filter;
  var inSetParams = _.filter(attrs.params,function(param) { return param.operator[0] == " IN " })
  // var results = {}
  _.each(data,function(value, key){
    //var value = _.isUndefined(val.$value) ? val : val.$value;

    // if(!key.indexOf("$")!==0 && _.isMatchDeep(value,filter)){
    if(_.isMatchDeep(value,filter)){
      // results[key] = value;
      results.push(value);
      //results.$objects.push(val);
    }
  });
  _.each(inSetParams,function(param){
    results = _.filter(results,function(object){
      return _.contains(param.value,_.valueOnPath(object,param.lhs,true));
    })
  });
  return results;
}

var UnwatchCache = function() {
  var unwatch = []

  this.find = function(callback){
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

  this.unwatch = function (callback) {
    var fn = this.find(callback);
    if (fn.unwatch) fn.unwatch();
  }
}

endevModule.service("$endevProvider",['$injector', function($injector){
  return {
    getContext: function(name,path,element,scope) {
      var provider, parent;
      var name = name || (path.search(/http(s)?:\/\//) > 1 ? "rest" : (path.match(PROTOCOL_REGEX) || [null,null])[1]);
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

endevModule.service("$endevLocal",['$q',function($q){

  var observers = {};

  var getType = _.memoize(function(type){
    var result;
    if(storageAvailable('localStorage') && localStorage.getItem(type)){
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

  var getData = function(path){
    if(path.indexOf(".")>0) {
      var type = getType(path.substring(0,path.indexOf(".")));
      return _.valueOnPath(type,path,true);
    }
    return getType(path);
  }

  var getRefOrDefault = function(path){
    var original = getType(getTypeFromPath(path));
    if(path.indexOf(".")<0){
      return original;
    } else {
      var id = path.substring(path.lastIndexOf(".")+1);
      var parent = _.valueOnPath(original,path.substring(0,path.lastIndexOf(".")),true);
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
    var copy = angular.copy(updatedItem);
    _.each(_.keys(copy),function(key) { if(key.indexOf('$') == 0) delete copy[key]})
    _.merge(collection[updatedItem.$$endevId], copy);
    save(path);
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
    if(storageAvailable('localStorage')){
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

  var unwatchCache = new UnwatchCache();

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

endevModule.service("$endevYql", ['$http','$q', function($http,$q){
  return {
    query: function(attrs,extra,callback) {
      var from = attrs.from.slice(attrs.from.indexOf(":")+1);
      var result = $q.defer()
      if(attrs.parentLabel){
        var tmp = _.valueOnPath(attrs.parentObject,from,true)
        if(callback && angular.isFunction(callback)) callback(tmp)
        else result.resolve(tmp);
      }else{
        var where = attrs.where;
        for(var i = 0; i<attrs.params.length; i++) {
          where = where.replace(attrs.params[i].expression, attrs.params[i].replace("'" + attrs.params[i].value + "'"));
        }
        var query;
        if(attrs.use) {
          query = "use '" + attrs.use + "' as tmpTable; select * from tmpTable";
        } else {
          query = "select * from " + from;
        }
        if(where) query += " where " + where;
        $http.get("https://query.yahooapis.com/v1/public/yql?q=" 
          + encodeURIComponent(query) 
          + "&diagnostics=true&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys&format=json")
          .success(function(data){
            var d = data.query.results;
            if(attrs.use && from.indexOf(".")>=0) {
              d = _.valueOnPath(data.query.results,from,true);
            }
            console.log("Data:",d);
            result.resolve(d);
          }).error(function(data){
            result.reject(data.error);
          });
      }
      return result.promise
    }
  }
}]);

endevModule.service("$endevRest", ['$http','$interpolate','$q', function($http,$interpolate,$q){ 

  function prependTransform(defaults, transform) {
    // We can't guarantee that the transform transformation is an array
    transform = angular.isArray(transform) ? transform : [transform];
    // Append the new transformation to the defaults
    return transform.concat(defaults);
  }

  return {
    query: function(attrs) {
      var where = "";
      for(var i = 0; i<attrs.params.length; i++) {
        where += attrs.params[i].attribute + "=" + encodeURIComponent(attrs.params[i].value);
        if(i < attrs.params.length-1) {
          where += "&";
        }
      }
      var config = {
        headers: angular.isString(attrs.headers) ? angular.fromJson(attrs.headers) : 
          angular.isObject(attrs.headers) ? attrs.headers : undefined,
        transformResponse: prependTransform($http.defaults.transformResponse, function(data, headersGetter) {
          if (headersGetter()['content-type']=="application/atom+xml") {
            var x2js = new X2JS();
            return x2js.xml_str2json(data);
          } else {
            return data;
          }
        })
      }
      var url = attrs.from
      if (url.indexOf('?') != -1) {
        url = url + "&" + where;
      } else {
        url = url + "?" + where;
      }
      var result = $q.defer()
      $http.get(url, config)
        .success(function(data){
          result.resolve(data);
        }).error(function(data){
          result.reject(data);
        });
      return result.promise;
    }
  }
}]);

//Firebase dependent features
if ($injector.has('$firebaseObject')) {
  
  endevModule.service("$endevFirebase",['$q','$firebaseObject','$firebaseArray', function($q,$firebaseObject,$firebaseArray){
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

    var unwatchCache = new UnwatchCache();

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
          unwatchCache.find(callback).unwatch = data.$watch(function(){
            console.log("Data changed:", data, attrs.where);
            object = filterData(data,attrs);               
            if(callback && angular.isFunction(callback)) callback(object);
          })
        });  

        return result.promise;
      },
      update: function(attrs) {
        var from = attrs.from.slice(attrs.from.indexOf(":")+1);
        var objRef = getObjectRef(from,attrs.parentLabel,attrs.parentObject,attrs.parentData);
        if(objRef) $firebaseObject(objRef).$loaded().then(function(parent){
          var object = $firebaseObject(parent.$ref().child(attrs.updatedObject.$id));
          _.merge(object,attrs.updatedObject);
          object.$save();
        });
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
          // var key = _.findKey(object,function(value){return _.isMatchDeep(value,attrs.newObject)})
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
}