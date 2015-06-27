var angular = require("angular");
var extend = require("extend");
var _ = require("underscore");

var OPERATORS_REGEX = new RegExp(/ AND | OR  /i);
var PATH_ROOT_REGEX = new RegExp(/^[a-zA-Z_$][0-9a-zA-Z_$]*/);

module.exports = function(ngModule) {
  ngModule.directive("from", function($interpolate,$endevProvider,$compile,$q,Expr){
    function getRoot(element) {
      if(element[0].tagName === 'OPTION') {
        return element.parent();
      }
      return element;
    }

    return {
      // terminal: true,
      priority: 1000,
      restrict: 'A',
      scope: true,
      compile: function(tElement,tAttributes) {
        if(tElement[0].tagName !== 'DATA') {
          var attrFrom = tAttributes.from;
          var label = tAttributes.from.split(" ")[1];
          var annotation = "FROM " + tAttributes.from;
          if (tAttributes.where) annotation += " WHERE " + tAttributes.where
          // tElement.parent().prepend("<span class='__endev_annotation__' ng-if='$annotation'>" + annotation + "</span>");
          // tElement.parent().prepend("<span endev-annotation='" + annotation + "' endev-annotation-data='endevData_" + label + "'></span>");
          // tAttributes.$set("ng-class","{'__endev_list_item_annotated__':$annotation}")
          tAttributes.$set("ng-repeat",label + " in $endevData_" + label );
          tAttributes.$set("endev-item",tAttributes.from)
          var container
          if(tElement.parent().length > 0 && ["TBODY"].indexOf(tElement.parent()[0].tagName)>=0) {
            tElement.parent().addClass("__endev_annotated__");
            tElement.parent().append("<span class='__endev_annotation__'>" + annotation + "</span>");
          }else {
            getRoot(tElement).wrap("<span class='__endev_annotated__'></span>").parent().prepend("<span class='__endev_annotation__'>" + annotation + "</span>");
          }
          // tElement.parent().prepend("<span></span>")

        }
        tElement.removeAttr("data-from");
        tElement.removeAttr("from");
        return {
          pre: function preLink(scope, iElement, iAttrs, controller) {  },
          post: function postLink(scope, element, attrs, controller,transform) {
            element  =  $compile(element)(scope);
            if(element[0].tagName !== 'DATA') {
              if(angular.isDefined(scope["$endevData_" + label])) 
                throw new Error("Conflicting object " + lable + " defined by:", element);
              var from = $interpolate(attrFrom,false,null,true)(scope);
              var type = from.split(",")[0].split(" ")[0];
              var params = attrs.where ? attrs.where.split(OPERATORS_REGEX).map( function(expr) {
                  var exp = new Expr(expr,label);
                  exp.setValue(scope.$eval(exp.rhs));
                  return exp;
                }) : [];
              var provider;
              var parent = null;
              if(attrs.provider) {
                provider = $endevProvider.get(attrs.provider,attrFrom);
              } else {
                var pathRoot = from.match(PATH_ROOT_REGEX);
                if(pathRoot){
                  provider = scope["$endevProvider_" + pathRoot[0]];
                  if(!provider) {
                    throw new Error("No self or parent provider found for:",from," on:", element);
                  }
                  parent = pathRoot[0];
                }
              }
              scope["$endevProvider_" + label] = provider;
              var watchExp = _.map(params,function(item){return item.rhs});
              if(parent) watchExp.push(parent);
              if(watchExp.length>0) {
                scope.$watchGroup(watchExp,function(values){
                  _.map(values.length > params.length ? values.slice(0,-1) : values ,function(value,index){
                    params[index].setValue(value)
                  });
                  console.log("Params changed for ",attrFrom,values);
                  execute();
                });
              } else {
                attrs.$observe('from',function(value){
                  from = value;
                  console.log("From changed for",value);
                  execute();
                })
              }

              var unbind;

              var callback = function(data) {
                // if(!_.isEqual(scope["_data_"],data))
                if(!angular.isArray(data)) data = [data];
                if(unbind) unbind();
                if((!data || !(data.length >0)) && attrs.default){
                // if(!(_.keys(data).length >3) && attrs.default){
                  var def = scope.$eval(attrs.default);
                  if(angular.isFunction(data.$add) && attrs.autoInsert) {
                    //TODO consider using where data as well
                    data.$add(def);
                  } else {
                    data.push(def);
                  }
                  // data['default'] = def;
                  scope['$isDefault'] = true;
                } else {
                  scope['$isDefault'] = false;
                }
                scope["$endevData_" + label] = data;
                if(scope["$endevAnnotation"]){
                  scope.$emit("$endevData_" + label, data);
                }
              };

              var execute = _.throttle(function (){ 
                console.log("Executed with params: ", params);
                if(provider){

                  var equalityParams = _.filter(params,function(param){return param.operator[0] == "="});
                
                  var filter = {};
                  equalityParams.forEach(function(param){
                    extend(true, filter, param.obj);
                  });

                  var queryParameters = _.defaults({from:type,where:attrs.where,params:params,filter:filter},_.extendOwn({},_.pick(attrs,function(value,key){ return key.indexOf('$') !=0 })));

                  if (parent) {
                    queryParameters.parentLabel = parent; 
                    queryParameters.parentObject = scope[parent];
                    queryParameters.parentData = scope["$endevData_" + parent];
                  }

                  provider.query(queryParameters,null,callback)
                    .then(function(data){
                      callback(data);
                    })
                    .catch(function(data){
                      console.log("Query error: ",data);
                      scope['$endevErrors'].push(data);
                    });
                }
              },100);//,angular.toJson);
              
            }
          }
        }
      },
      controller: function($scope, $element, $attrs){
        $scope.count = function(object){
          return _.size(object);
        }
      }
    }
  });
};
