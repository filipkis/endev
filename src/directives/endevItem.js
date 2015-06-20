endevModule.directive("endevItem",["$endevProvider","$interpolate",function($endevProvider,$interpolate){
  return {
    // require: "^from",
    link: function(scope,element,attrs,fromCtrl){
      var attrFrom = attrs.endevItem;
      var label = attrs.endevItem.split(" ")[1];
      var from = $interpolate(attrFrom,false,null,true)(scope);
      var type = from.split(" ")[0];
      var provider;
      var parent = null;
      if(attrs.provider) {
        provider = $endevProvider.get(attrs.provider,attrFrom);
      } else {
        var pathRoot = from.match(PAHT_ROOT_REGEX);
        if(pathRoot){
          provider = scope["$endevProvider_" + pathRoot[0]];
          if(!provider) {
            throw new Error("No self or parent provider found for:",attrFrom, " on:", element);
          }
          parent = pathRoot[0];
        }
      }
      if(attrs.autoUpdate){
        // scope.$watch(label,function(value){
          var value = scope[label];
          if(value && provider.bind && !value['default']){
            console.log("Item value changed",value);
            var queryParameters = {from:type,scope:scope,label:label};

            queryParameters.parentObject = value;
            queryParameters.parentData = scope["$endevData_" + label];

            provider.bind(queryParameters);
          }
      }
      scope.$watch(label,function(value){
        if(value && attrs.loaded){
          scope.$eval(attrs.loaded);
        }
      });
    }
  }
}]);
