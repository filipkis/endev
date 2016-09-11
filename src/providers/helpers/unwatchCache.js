var _ = require('underscore');

module.exports = function() {
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