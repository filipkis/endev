module.exports = function(ngModule) {
  ngModule.service("$endevProvider", function($injector){
    return {
      get: function(provider,type){
        return provider ? $injector.get('$endev' + provider[0].toUpperCase() + provider.slice(1)) :
          type.search(/http(s)?:\/\//) == 0 ? $injector.get("$endevRest") : $injector.get('$endevYql');
      }
    }
  });
}
