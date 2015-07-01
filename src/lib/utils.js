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

_.valueOnPath = function(object,path,removeRoot) {

  return _.reduce((removeRoot ? path.substring(path.indexOf(".")+1) : path).split("."),function(memo,id){
    return angular.isDefined(memo) ? memo[id] : null;
  },object)
}
