_ = require('underscore');

var utils = {}

// Deep merge
utils.merge = function(obj, depth) {
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
          obj[prop] = _.reject(utils.merge(_.clone(obj[prop]), source[prop]), function (item) { return _.isNull(item);});
        }
      }
      else if (_.isObject(obj[prop]) || _.isObject(source[prop])){
        if (!_.isObject(obj[prop]) || !_.isObject(source[prop])){
          throw new Error('Trying to combine an object with a non-object (' + prop + ')');
        } else {
          obj[prop] = utils.merge(_.clone(obj[prop]), source[prop]);
        }
      } else {
        obj[prop] = source[prop];
      }
    }
  });
  return obj;
};

utils.isMatchDeep = function(object, attrs) {
  attrs = _.extendOwn({},attrs);
  var keys = _.keys(attrs), length = keys.length;
  if (object == null) return !length;
  var obj = Object(object);
  for (var i = 0; i < length; i++) {
    var key = keys[i];
    if (_.isObject(attrs[key])) {
      if (!utils.isMatchDeep(object[key],attrs[key])) return false;
    } else {
      if (attrs[key] !== obj[key] || !(key in obj)) return false;
    }
  }
  return true;
};

utils.valueOnPath = function(object,path,removeRoot) {
  if(removeRoot && path.indexOf(".") < 0) return object;
  return _.reduce((removeRoot ? path.substring(path.indexOf(".")+1) : path).split("."),function(memo,id){
    return (angular.isDefined(memo) && memo != null) ? memo[id] : null;
  },object)
}

utils.syntaxHighlight = function(json) {
  json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
    var cls = '_endev_json_number_';
    if (/^"/.test(match)) {
      if (/:$/.test(match)) {
        cls = '_endev_json_key_';
      } else {
        cls = '_endev_json_string_';
      }
    } else if (/true|false/.test(match)) {
      cls = '_endev_json_boolean_';
    } else if (/null/.test(match)) {
      cls = '_endev_json_null_';
    }
    return '<span class="' + cls + '">' + match + '</span>';
  });
}

utils.storageAvailable = function(type) {
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

utils.removeFn = function(removeFrom,object,parent,scope,provider) {
  console.log("Removing:",object);
  var queryParameters = {removeFrom:removeFrom,newObject:object};

  if (parent) {
    queryParameters.parentLabel = parent;
    queryParameters.parentObject = scope[parent];
    queryParameters.parentData = scope["$endevData_" + parent];
  }

  provider.remove(queryParameters)
}

module.exports = utils