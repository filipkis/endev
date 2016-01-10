/*
// Use to debug catching
_.memoize = function(func, hasher) {
  console.log('Created memoized function:');
  console.log(func.toString().substring(0,func.toString().indexOf("\n")))
  var memoize = function(key) {
    var cache = memoize.cache;
    var address = '' + (hasher ? hasher.apply(this, arguments) : key);
    if (!_.has(cache, address)) {
      console.log("Executed:");
      cache[address] = func.apply(this, arguments);
    } else {
      console.log("From cache:")
    }
    console.log(address);
    console.log(arguments);
    console.log(this);
    return cache[address];
  };
  memoize.cache = {};
  return memoize;
};*/

// Deep merge
_.merge = function(obj, depth) {
  var parentRE = /#{\s*?_\s*?}/,
  slice = Array.prototype.slice;
 
  _.each(slice.call(arguments, 1), function(source) {
    for (var prop in source) {
      if (_.isNull(obj[prop]) || _.isUndefined(obj[prop]) || _.isFunction(obj[prop]) || _.isNull(source[prop]) || _.isDate(source[prop])) {
        obj[prop] = source[prop];
      }
      else if (_.isString(source[prop]) && parentRE.test(source[prop])) {
        if (_.isString(obj[prop])) {
          obj[prop] = source[prop].replace(parentRE, obj[prop]);
        }
      }
      else if (_.isArray(obj[prop]) || _.isArray(source[prop])){
        if (!_.isArray(obj[prop]) || !_.isArray(source[prop])){
          throw new Error('Trying to combine an array with a non-array (' + prop + ')');
        } else {
          obj[prop] = _.reject(_.merge(_.clone(obj[prop]), source[prop]), function (item) { return _.isNull(item);});
        }
      }
      else if (_.isObject(obj[prop]) || _.isObject(source[prop])){
        if (!_.isObject(obj[prop]) || !_.isObject(source[prop])){
          throw new Error('Trying to combine an object with a non-object (' + prop + ')');
        } else {
          obj[prop] = _.merge(_.clone(obj[prop]), source[prop]);
        }
      } else {
        obj[prop] = source[prop];
      }
    }
  });
  return obj;
};

_.isMatchDeep = function(object, attrs) {
  attrs = _.extendOwn({},attrs);
  var keys = _.keys(attrs), length = keys.length;
  if (object == null) return !length;
  var obj = Object(object);
  for (var i = 0; i < length; i++) {
    var key = keys[i];
    if (_.isObject(attrs[key])) {
      if (!_.isMatchDeep(object[key],attrs[key])) return false;
    } else {
      if (attrs[key] !== obj[key] || !(key in obj)) return false;
    }
  }
  return true;
};

_.matcherDeep = function(attrs) {
  return function(obj) {
    return _.isMatchDeep(obj,attrs);
  } 
} 

var hasherWithThis = function() {
  return JSON.stringify({this:this,args:arguments});
}; 

_.valueOnPath = function(object,path,removeRoot) {

  return _.reduce((removeRoot ? path.substring(path.indexOf(".")+1) : path).split("."),function(memo,id){
    return angular.isDefined(memo) ? memo[id] : null;
  },object)
}

function storageAvailable(type) {
  try {
    var storage = window[type],
        x = '__storage_test__';
    storage.setItem(x, x);
    storage.removeItem(x);
    return true;
  }
  catch(e) {
    return false;
  }
}