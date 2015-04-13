	
var OPERATORS_REGEX = new RegExp(/ AND | OR  /i);
var COMPARISON_REGEX = new RegExp(/[=!><]+| (?:NOT )?LIKE | (?:NOT )?IN | IS (?:NOT )?NULL | (?:NOT )?MATCHES /);
var PATH_REGEX = new RegExp(/^(?:[a-zA-Z_$][0-9a-zA-Z_$]*\.)*(?:[a-zA-Z_$][0-9a-zA-Z_$]*)/);
var PAHT_ROOT_REGEX = new RegExp(/^[a-zA-Z_$][0-9a-zA-Z_$]*/);



var endevModule;
//checking if angularFire is loaded
try{ 
  angular.module("firebase")
  endevModule = angular.module("Endev", ["endev-templates","endev-data-tag","firebase"]);  
} catch(err) {
  endevModule = angular.module("Endev",["endev-templates","endev-data-tag"]);
}

var $injector = angular.injector(["ng","Endev"]);

endevModule.factory("Expr",[function(){
  function Expr(expr,label) {
    this.expression = expr;
    this.lhs = expr.split(COMPARISON_REGEX)[0].trim();
    this.rhs = expr.split(COMPARISON_REGEX)[1].trim();
    this.operator = COMPARISON_REGEX.exec(expr);
    this.attribute = this.lhs.replace(new RegExp("^" + label + ".", "g"),"");
    this.setValue = function(value) {
      this.value = value;
      this.obj = _.reduceRight(this.attribute.split("."),function(memo,id){ var result = {}; result[id] = memo; return result}, value);
      return value;
    }
    this.replace = function(value) {
      return (this.attribute || this.lhs) + this.operator + value;
    }
  }
  return Expr;
}]);

endevModule.directive("import",['$rootScope',function($rootScope) {
	return {
		compile:function(tElement, tAttrs) {
			angular.forEach(tAttrs.import.split(","), function(item){
				item = item.trim();
				$rootScope[item] = window[item];
			});
		}
	}
}]);

_.each([['if','ng-show'],['click','ng-click']],function(pair){
  endevModule.directive(pair[0],['$compile',function($compile){
    return {
      terminal: true,
      priority: 1000,
      compile: function(element, attrs) {
        element.attr(pair[1], attrs[pair[0]]);
        element.removeAttr("data-" + pair[0]);
        return {
          pre: function preLink(scope, iElement, iAttrs, controller) {  },
          post: function postLink(scope, iElement, iAttrs, controller) {  
            $compile(iElement)(scope);
          }
        };
      }
    }
  }]);
},this);

endevModule.directive("new",['$compile',function($compile){
  return {
    terminal: true,
    priority: 1000,
    compile: function(element, attrs) {
      element.attr("ng-if", "$isDefault");
      element.removeAttr("data-new");
      return {
        pre: function preLink(scope, iElement, iAttrs, controller) {  },
        post: function postLink(scope, iElement, iAttrs, controller) {  
          $compile(iElement)(scope);
        }
      };
    }
  }
}]);

endevModule.directive("edit",['$compile',function($compile){
  return {
    terminal: true,
    priority: 1000,
    compile: function(element, attrs) {
      element.attr("ng-if", "!$isDefault");
      element.removeAttr("data-edit");
      return {
        pre: function preLink(scope, iElement, iAttrs, controller) {  },
        post: function postLink(scope, iElement, iAttrs, controller) {  
          $compile(iElement)(scope);
        }
      };
    }
  }
}]);

endevModule.directive("value",['$compile',function($compile){
  return {
    priority: 1000, 
    terminal:true,
    compile: function(tElement,tAttributes) {
      if(tAttributes.$attr["value"]==="data-value"){
        tElement.attr("ng-model", tAttributes.value);
        tElement.removeAttr("data-value");
      }
      return {
        pre: function preLink(scope, iElement, iAttrs, controller) {  },
        post: function postLink(scope, iElement, iAttrs, controller) {  
          if(iAttrs.$attr["value"]==="data-value"){
            $compile(iElement)(scope);
          }
        }
      };
    }
  }
}]);

endevModule.directive("else",['$compile',function($compile){
  return {
    terminal: true,
    priority: 1000, 
    compile: function(tElement,tAttributes) {
      var prev = _.find(tElement.parent().children(),function(child){
        return angular.element(child).next()[0] == tElement[0]
      });
      if(prev && angular.element(prev).attr("ng-show")) {
        tAttributes.$set("ng-show","!" + angular.element(prev).attr("ng-show"));
      } else {
        console.log("data-else needs to come directly after data-if tag");
      }
      tElement.removeAttr("data-else");
      return {
        pre: function preLink(scope, iElement, iAttrs, controller) {  },
        post: function postLink(scope, iElement, iAttrs, controller) {  
          $compile(iElement)(scope);
        }
      };
    }
  }
}]);

endevModule.directive("endevAnnotation",[function(){      
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
            throw new Error("No self or parent provider found for:",attrFrom);
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
        // });
      }
    }
  }
}]);

endevModule.directive("from",['$interpolate','$endevProvider','$compile','$q','Expr', function($interpolate,$endevProvider,$compile,$q,Expr){
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
        if(["TBODY"].indexOf(tElement.parent()[0].tagName)>=0) {
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
            var type = from.split(" ")[0];
            var params = attrs.where ? attrs.where.split(OPERATORS_REGEX).map( function(expr) {
                var exp = new Expr(expr,label);
                exp.setValue(scope.$eval(exp.rhs));
                return exp;
              }) : [];
            var provider;
            var parent = null;
            if(attrs.provider) {
              provider = $endevProvider.get(attrs.provider,attrFrom);
              scope["$endevProvider_" + label] = provider;
            } else {
              var pathRoot = from.match(PAHT_ROOT_REGEX);
              if(pathRoot){
                provider = scope["$endevProvider_" + pathRoot[0]];
                if(!provider) {
                  throw new Error("No self or parent provider found for:",from);
                }
                parent = pathRoot[0];
              }
            }
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
                data.push(def);
                // data['default'] = def;
                scope['$isDefault'] = true;
              } else {
                scope['$isDefault'] = false;
              }
              scope["$endevData_" + label] = data;
              if(scope["$endevAnnotation"]){
                scope.$emit("$endevData_" + label, data);
              }
              // if(dataToBind) {
              //   dataToBind.$bindTo(scope,"$endevDataFull_" + label).then(function(unb){
              //     unbind = unb;
              //   });
              // }
              // }
            };

            var execute = _.throttle(function (){ 
              console.log("Executed with params: ", params);
              if(provider){
              
                var filter = _.reduce(params,function(memo,param){return _.merge(param.obj,memo)},{});
                // console.log("Filter: ", filter);
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
}]);

endevModule.directive("insertInto", ['$interpolate','$endevProvider', function($interpolate,$endevProvider) {
  return {
    scope:true,
    link: function (scope,element,attrs) {
      var insertInto = $interpolate(attrs.insertInto,false,null,true)(scope)
      var provider;

      if(attrs.provider) {
        provider = $endevProvider.get(attrs.provider,insertInto);
      } else {
        var pathRoot = insertInto.match(PAHT_ROOT_REGEX);
        if(pathRoot){
          provider = scope["$endevProvider_" + pathRoot[0]];
          if(!provider) {
            throw new Error("No self or parent provider found for:",insertInto);
          }
          parent = pathRoot[0];
        }
      }
      scope.insert = function(object) {
        console.log("Inserting:",object);

        var queryParameters = {insertInto:insertInto,newObject:object};

        if (parent) {
          queryParameters.parentLabel = parent; 
          queryParameters.parentObject = scope[parent];
          queryParameters.parentData = scope["$endevData_" + parent];
        }

        provider.insert(queryParameters).then(function(data){
          if(!_.isEqual(object,data)){
            object = data;
          }
        });
      }
    }
  }
}]);

endevModule.directive("removeFrom", ['$interpolate','$endevProvider', function($interpolate,$endevProvider) {
  return {
    scope:true,
    link: function (scope,element,attrs) {
      var removeFrom = $interpolate(attrs.removeFrom,false,null,true)(scope)
      var provider;

      if(attrs.provider) {
        provider = $endevProvider.get(attrs.provider,removeFrom);
      } else {
        var pathRoot = removeFrom.match(PAHT_ROOT_REGEX);
        if(pathRoot){
          provider = scope["$endevProvider_" + pathRoot[0]];
          if(!provider) {
            throw new Error("No self or parent provider found for:",removeFrom);
          }
          parent = pathRoot[0];
        }
      }
      scope.remove = function(object) {
        console.log("Removing:",object);

        var queryParameters = {removeFrom:removeFrom,newObject:object};

        if (parent) {
          queryParameters.parentLabel = parent; 
          queryParameters.parentObject = scope[parent];
          queryParameters.parentData = scope["$endevData_" + parent];
        }

        provider.remove(queryParameters)
      }
    }
  }
}]);
          
//The basic run
endevModule.run(["$rootScope","$document","$templateCache",function($rootScope,$document,$templateCache){
  $rootScope.Date = Date;
  $rootScope.Math = Math;
  $rootScope.$endevAnnotation = false;
  $rootScope.$endevErrors = []
  angular.element($document[0].body).attr("ng-class","{'__endev_annotation_on__':$endevAnnotation}");
  angular.element($document[0].body).append($templateCache.get('endevHelper.tpl.html'));
}]);