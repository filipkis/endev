var _ = require('underscore');
var utils = require('./../../utils');

module.exports = function (data, attrs) {
  var results = [];
  var filter = attrs.filter;
  var inSetParams = _.filter(attrs.params,function(param) { return param.operator[0] == " IN " })
  var notEqual = _.filter(attrs.params,function(param) { return param.operator[0] == "!=" })
  var lgtComparison = _.filter(attrs.params,function(param) { return param.operator[0] == ">" || param.operator[0] == "<" || param.operator[0] == ">=" || param.operator[0] == "<=" })
  // var results = {}
  _.each(data,function(value, key){
    //var value = _.isUndefined(val.$value) ? val : val.$value;
    var equalId = false;
    if(value && filter && (value.$id && value.$id == filter.$id
      || (value.$$endevId && value.$$endevPath && value.$$endevId == filter.$$endevId && value.$$endevPath == filter.$$endevPath))){
      equalId = true;
    }

    // if(!key.indexOf("$")!==0 && utils.isMatchDeep(value,filter)){
    if(equalId || utils.isMatchDeep(value,filter)){
      // results[key] = value;
      results.push(value);
      //results.$objects.push(val);
    }
  });
  _.each(notEqual,function(param){
    results = _.filter(results,function(object){
      return utils.valueOnPath(object,param.lhs,true) != param.value;
    })
  })
  _.each(lgtComparison,function(param){
    results = _.filter(results,function(object){
      var value = utils.valueOnPath(object,param.lhs,true);
      switch (param.operator[0]){
        case ">":
          return value > param.value;
        case "<":
          return value < param.value;
        case ">=":
          return value >= param.value;
        case "<=":
          return value <= param.value;
      }
    })
  })
  _.each(inSetParams,function(param){
    results = _.filter(results,function(object){
      return _.contains(param.value,utils.valueOnPath(object,param.lhs,true));
    })
  });
  return results;
}