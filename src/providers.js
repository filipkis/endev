endevModule.service("$endevProvider",['$injector', function($injector){
  return {
    get: function(provider,type){
      return provider ? $injector.get('$endev' + provider[0].toUpperCase() + provider.slice(1)) :
        type.search(/http(s)?:\/\//) == 0 ? $injector.get("$endevRest") : $injector.get('$endevYql');
    }
  }
}]);

endevModule.service("$endevYql", ['$http','$q', function($http,$q){ 
  return {
    query: function(attrs,extra,callback) {
      var result = $q.defer()
      if(attrs.parentLabel){
        var tmp = _.reduce(attrs.from.substring(attrs.parentLabel.length+1).split("."),function(memo,id){
          console.log("Loging path:",memo,id);
          return angular.isDefined(memo) ? memo[id] : null;
        },attrs.parentObject)
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
          query = "select * from " + attrs.from;
        }
        if(where) query += " where " + where;
        $http.get("https://query.yahooapis.com/v1/public/yql?q=" 
          + encodeURIComponent(query) 
          + "&diagnostics=true&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys&format=json")
          .success(function(data){
            var d = data.query.results;
            if(attrs.use && attrs.from.indexOf(".")>=0) {
              d = _.reduce(attrs.from.substring(attrs.from.indexOf(".")+1).split("."),function(memo,id){
                return angular.isDefined(memo) ? memo[id] : null;
              },data.query.results)
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

    function filterData(data,filter){
      var results = []
      // var results = {}
      results.$endevProviderType = "firebase";
      results.$ref = data.$ref()
      _.each(data,function(value, key){
        // if(!key.indexOf("$")!==0 && _.isMatchDeep(value,filter)){
        if(_.isMatchDeep(value,filter)){
          // results[key] = value;
          results.push(value);
        }
      });
      return results;
      // return _.filter(_.reject(data,function(value,key){return key.indexOf("$")===0}),_.matcherDeep(filter))
    }

    return {
      query: function(attrs,extraAttrs,callback) {
        var result = $q.defer();

        if(unwatchCache(callback).unwatch) unwatchCache(callback).unwatch();
        var objRef = getObjectRef(attrs.from,attrs.parentLabel,attrs.parentObject,attrs.parentData);
        // TODO  need to add a watcher for the result and then update the value somehow
        $firebaseArray(objRef).$loaded().then(function(data){

          console.log("Data:",data)
          var object = filterData(data,attrs.filter);
          if(object.length === 0 && attrs.autoInsert) {
            data.$add(attrs.filter)
          }
          object.$endevRef = objRef;
          object.$add = function(addObj){
            data.$add(addObj);
          }
          console.log("Object:",object)
          if(callback && angular.isFunction(callback)) callback(object,data);
          else result.resolve(object);
          unwatchCache(callback).unwatch = data.$watch(function(){
            console.log("Data changed:", data, attrs.where);
            object = filterData(data,attrs.filter);               
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
          // var key = _.findKey(object,function(value){return _.isMatchDeep(value,attrs.newObject)})
          $firebaseObject(object.$ref().child(attrs.newObject.$id)).$remove();
        })

      },
      bind: function(attrs) {
        var objRef = getObjectRef(attrs.from,attrs.parentLabel,attrs.parentObject,attrs.parentData);
        if(objRef) $firebaseObject(objRef).$bindTo(attrs.scope,attrs.label)
      }

    }
  }]);
}