var angular = require('angular');
var utils = require('./../utils');
var highlight = require('./highlight');

var OPERATORS_REGEX = new RegExp(/ AND | OR  /i);

angular.module('Endev').directive("endevAnnotation",[function(){
  return {
    // scope: {
    //   // annotation: "=endevAnnotation",
    //   // data: "=endevAnnotationData"
    // },
    link: function (scope,element,attrs) {
      element.prepend("<span class='__endev_annotation__'>" + attrs.endevAnnotation + "</span>");
      scope.$on("$endevData_" + attrs.endevAnnotation,function(event,data){

        element.append(angular.toJson(data,true));
        event.stopPropagation();
      })
      // scope.$watch("data",function(value){
      //   scope["formatedData"] = angular.toJson(value,true);
      // })
    }
  }
}]);

angular.module('Endev').directive("endevItem",["$endevProvider","$interpolate",function($endevProvider,$interpolate){
  return {
    // require: "^from",
    link: function(scope,element,attrs){
      var attrFrom = attrs.endevItem;
      var label = attrs.endevItem.split(" ")[1];
      var from = $interpolate(attrFrom,false,null,true)(scope);
      var type = from.split(" ")[0];
      var context = $endevProvider.getContext(attrs.provider,attrFrom,element,scope);
      var provider = context.provider;
      var parent = context.parent;

      if(attrs.hasOwnProperty("autoUpdate") && (attrs.autoUpdate == "" || attrs.autoUpdate)){
        // scope.$watch(label,function(value){
        var value = scope[label];
        if(value && provider.bind && !value['default']){
          console.log("Item value changed",value);
          var queryParameters = {from:type,scope:scope,label:label};

          queryParameters.object = value;
          queryParameters.data = scope["$endevData_" + label];

          if(parent) {
            queryParameters.parentLabel = parent;
            queryParameters.parentObject = scope[parent];
            queryParameters.parentData = scope["$endevData_" + parent];
          }

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

angular.module('Endev').directive("from",['$interpolate','$endevProvider','$compile','$q','$rootScope','$timeout','Expr', function($interpolate,$endevProvider,$compile,$q,$rootScope,$timeout,Expr){
  function getRoot(element) {
    if(element[0].tagName === 'OPTION') {
      return element.parent();
    }
    return element;
  }

  function getParentLabel(scope,object){
    var pLabel = _.chain(scope)
      .allKeys()
      .filter(function(key){return key.indexOf("$endevData_")==0})
      .find(function(key){return _.find(scope[key], function(value){return angular.equals(object,value)})})
      .value();
    return pLabel.substring(pLabel.indexOf("_")+1);
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
        tAttributes.$set("ng-repeat",label + " in $endevData_" + label + " track by $endevId(" + label + ",$id)" );
        tAttributes.$set("endev-item",tAttributes.from);
        tAttributes.$set("ng-mouseover",'endevHighlight($event);' + (tAttributes.mouseover ? tAttributes.mouseover : ''));
        tAttributes.$set("ng-click",'endevHighlightDetails($event,'+ label + ');' + (tAttributes.click ? tAttributes.click : ''));
        if(tElement.parent().length > 0 && ["TBODY"].indexOf(tElement.parent()[0].tagName)>=0) {
          tElement.parent().addClass("__endev_annotated__");
          tElement.parent().append("<span class='__endev_annotation__'>" + annotation + "</span>");
        }else {
          getRoot(tElement).wrap("<span class='__endev_annotated__'></span>").parent().prepend("<span class='__endev_annotation__'>" + annotation + "</span>");
        }
         tElement.parent().prepend("<span></span>")

      }
      tElement.removeAttr("data-from");
      tElement.removeAttr("from");
      return {
        pre: function preLink(scope, iElement, iAttrs, controller) {  },
        post: function postLink(scope, element, attrs, controller,transform) {
          element  =  $compile(element)(scope);
          if(element[0].tagName !== 'DATA') {
            if(angular.isDefined(scope["$endevData_" + label]))
              throw new Error("Conflicting object " + label + " defined by:", element);
            var from = $interpolate(attrFrom,false,null,true)(scope);
            var type = from.split(",")[0].split(" ")[0];
            scope.endevHighlightDetails = function(event,value){
              if(scope.$root.$endevSelector){
                scope.$root.$endevCurrentAnnotation = "FROM " + from + (attrs.where ? " WHERE " + attrs.where : "");
                scope.$root.$endevCurrentObject = value;
                event.stopPropagation();
              }
            }
            var params = attrs.where ? attrs.where.split(OPERATORS_REGEX).map( function(expr) {
              var exp = new Expr(expr,label);
              exp.setValue(scope.$eval(exp.rhs));
              return exp;
            }) : [];
            var context = $endevProvider.getContext(attrs.provider,from,element,scope);
            var provider = context.provider;
            var parent = context.parent;

            scope.$endevId = function(item,idFn) {
              if (item) {
                return item.$$endevId || item.$id || idFn(item);
              }
              return idFn(item);
            }

            if(provider.update) {
              scope.update = function(object,data) {
                var pLabel = getParentLabel(scope,object);
                var type = scope["$endevParentType_" + pLabel];
                var label = pLabel;
                var parent = scope["$endevParentParent_" + pLabel];
                var queryParameters = {from:type,scope:scope,label:label};

                if (parent) {
                  queryParameters.parentLabel = parent;
                  queryParameters.parentObject = scope[parent];
                  queryParameters.parentData = scope["$endevData_" + parent];
                }

                queryParameters.updatedObject = _.extend(object,data);
                provider.update(queryParameters);
              }
            }
            if(provider.remove) {
              scope.remove = scope['delete'] = function(object){
                var pLabel = getParentLabel(scope,object);
                utils.removeFn(scope["$endevParentType_" + pLabel],object,scope["$endevParentParent_" + pLabel],scope,scope["$endevProvider_" + pLabel]);
              }
            }
            scope["$endevParentParent_" + label] = parent;
            scope["$endevParentType_" + label] = type;
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
              $timeout(function(){
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
                if(angular.isArray(data) && attrs.limit){
                  data = data.slice(0,parseInt(attrs.limit));
                }
                scope["$endevData_" + label] = data;
                if(scope["$endevAnnotation"]){
                  scope.$emit("$endevData_" + label, data);
                }
              })
            };

            var executionId = 0;

            var execute = _.debounce(function (){
              console.log("Executed with params: ", params);
              if(provider){

                var equalityParams = _.filter(params,function(param){return param.operator[0] == "="});

                var filter = _.reduce(equalityParams,function(memo,param){return utils.merge(param.obj,memo)},{});
                // console.log("Filter: ", filter);
                var queryParameters = _.defaults({from:type,where:attrs.where,params:params,filter:filter},_.extendOwn({},_.pick(attrs,function(value,key){ return key.indexOf('$') !=0 })));

                if (parent) {
                  queryParameters.parentLabel = parent;
                  queryParameters.parentObject = scope[parent];
                  queryParameters.parentData = scope["$endevData_" + parent];
                }

                var id = ++executionId;

                var executionCallback = function(data){
                  if (id == executionId){
                    callback(data);
                  }
                }

                provider.query(queryParameters,null,executionCallback)
                  .then(function(data){
                    scope['$endevError'] = false;
                    executionCallback(data);
                  })
                  .catch(function(data){
                    scope['$endevError'] = true;
                    console.log("Query error: ",data);
                    scope['$endevErrors'].push(data);
                  });
              }
            },100);//,angular.toJson);

          }
        }
      }
    },
    controller: function($scope){
      $scope.count = function(object){
        return _.size(object);
      }
      $scope.endevHighlight = function(event){
        if($scope.$root.$endevSelector){
          $scope.$root.$endevCurrentAnnotation = null;
          $scope.$root.$endevCurrentObject = null;
          highlight.select(event.currentTarget);
          event.stopPropagation();
        } 
      }
    }
  }
}]);

