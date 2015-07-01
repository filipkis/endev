_.valueOnPath = function(object,path,removeRoot) {

  return _.reduce((removeRoot ? path.substring(path.indexOf(".")+1) : path).split("."),function(memo,id){
    return angular.isDefined(memo) ? memo[id] : null;
  },object)
}
