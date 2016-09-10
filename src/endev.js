	
var OPERATORS_REGEX = new RegExp(/ AND | OR  /i);
var COMPARISON_REGEX = new RegExp(/[=!><]+| (?:NOT )?LIKE | (?:NOT )?IN | IS (?:NOT )?NULL | (?:NOT )?MATCHES /);



var endevModule;
var modulesToLoad = ["endev-templates","endev-data-tag"]
if(window.endevAngularModulesToLoad && angular.isArray(window.endevAngularModulesToLoad)){
  modulesToLoad = modulesToLoad.concat(window.endevAngularModulesToLoad);
}

//checking if angularFire is loaded
try{ 
  angular.module("firebase")
  endevModule = angular.module("Endev", modulesToLoad.concat("firebase"));
} catch(err) {
  endevModule = angular.module("Endev", modulesToLoad);
}

var $injector = angular.injector(["ng","Endev"]);

endevModule.factory("Expr",[function(){
  function Expr(expr,label) {
    this.expression = expr;
    this.lhs = expr.split(COMPARISON_REGEX)[0].trim();
    this.rhs = expr.split(COMPARISON_REGEX)[1].trim();
    this.operator = COMPARISON_REGEX.exec(expr);
    this.attribute = this.lhs == label ? "" : this.lhs.replace(new RegExp("^" + label + ".", "g"),"");
    this.setValue = function(value) {
      this.value = value;
      if(this.attribute != "") {
        this.obj = _.reduceRight(this.attribute.split("."),function(memo,id){ var result = {}; result[id] = memo; return result}, value);
      } else {
        this.obj = value;
      }
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

endevModule.directive("drag",['$compile',function($compile){
  return {
    link: function (scope,element,attrs) {
      element.bind("dragstart", function(ev){
        ev.dataTransfer.setData("text/plain", JSON.stringify(scope.$eval(attrs.drag)));
        ev.dataTransfer.effectAllowed = "move";
      })
      // If can drag condition set
      if(attrs.canDrag) {
        scope.$watch(attrs.canDrag,function(newValue){
          if(newValue){ // and condition ture
            attrs.$set("draggable","true") // make it draggable
          } else {
            attrs.$set("draggable","false") // make it non-draggable
          }
        })
      } else { // make it draggable
        attrs.$set("draggable","true");
      }
    }
  }
}]);

endevModule.directive("drop",['$compile',function($compile){
  return {
    link: function (scope,element,attrs) {
      element.bind("dragover",function(ev){
        ev.dataTransfer.effectAllowed = "move";
        ev.preventDefault();
        return false;
      })
      element.bind("drop", function(ev){
        ev.preventDefault();
        var data = JSON.parse(ev.dataTransfer.getData('text'));
        var canDrop = attrs.canDrop ? scope.$eval(attrs.canDrop,{source:data,target:scope}) : true;
        if(canDrop) {
          scope.$eval(attrs.drop,{source:data,target:scope});
          scope.$apply();
        }
      })
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

endevModule.directive("from",['$interpolate','$endevProvider','$compile','$q','$rootScope','$timeout','Expr', function($interpolate,$endevProvider,$compile,$q,$rootScope,$timeout,Expr){
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
        tAttributes.$set("endev-item",tAttributes.from)
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
              throw new Error("Conflicting object " + label + " defined by:", element);
            var from = $interpolate(attrFrom,false,null,true)(scope);
            var type = from.split(",")[0].split(" ")[0];
            var params = attrs.where ? attrs.where.split(OPERATORS_REGEX).map( function(expr) {
                var exp = new Expr(expr,label);
                exp.setValue(scope.$eval(exp.rhs));
                return exp;
              }) : [];
            var context = $endevProvider.getContext(attrs.provider,attrFrom,element,scope);
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
                removeFn(scope["$endevParentType_" + pLabel],object,scope["$endevParentParent_" + pLabel],scope,scope["$endevProvider_" + pLabel]);
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
              
                var filter = _.reduce(equalityParams,function(memo,param){return _.merge(param.obj,memo)},{});
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
      var context = $endevProvider.getContext(attrs.provider,insertInto,element,scope);
      var provider = context.provider;
      var parent = context.parent;

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

var removeFn = function(removeFrom,object,parent,scope,provider) {
  console.log("Removing:",object);
  var queryParameters = {removeFrom:removeFrom,newObject:object};

  if (parent) {
    queryParameters.parentLabel = parent;
    queryParameters.parentObject = scope[parent];
    queryParameters.parentData = scope["$endevData_" + parent];
  }

  provider.remove(queryParameters)
}

//For backwards capability
endevModule.directive("removeFrom", ['$interpolate','$endevProvider', function($interpolate,$endevProvider) {
  return {
    scope:true,
    link: function (scope,element,attrs) {
      var removeFrom = $interpolate(attrs.removeFrom,false,null,true)(scope)
      var context = $endevProvider.getContext(attrs.provider,removeFrom,element,scope);
      var provider = context.provider;
      var parent = context.parent;

      scope.remove = function(object) {
        removeFn(removeFrom,object,parent,scope,provider)
      }
    }
  }
}]);

endevModule.directive("deleteFrom", ['$interpolate','$endevProvider', function($interpolate,$endevProvider) {
  return {
    scope:true,
    link: function (scope,element,attrs) {
      var deleteFrom = $interpolate(attrs.deleteFrom,false,null,true)(scope)
      var context = $endevProvider.getContext(attrs.provider,deleteFrom,element,scope);
      var provider = context.provider;
      var parent = context.parent;

      scope.remove = function(object) {
        removeFn(deleteFrom,object,parent,scope,provider)
      }
    }
  }
}]);

endevModule.directive("explain",function(){
  return {
    link: function(scope,element,attrs) {
      scope.$watch(attrs.explain,function(newValue){
        if(!_.isUndefined(newValue)){
          element[0].innerHTML = "<pre class='_endev_json_'>" + syntaxHighlight(JSON.stringify(newValue, undefined, 2)) + "</pre>";
        }
      });
    }
  }
})

endevModule.directive("describe",['$endevProvider',function($endevProvider){
  return {
    priority: 1001,
    terminal: true,
    link: function(scope,element,attrs) {
      var yql = $endevProvider.getContext("yql").provider;
      if(!_.isUndefined(attrs.describe)) {
        yql.desc(attrs.describe).then(function(desc){
          var res = {
            parameters: _.map(desc.request.select.key,function(value){return _.pick(value,"name","type","required")})
          }
          var text = desc.name
          if(desc.meta.documentationURL) {
            text = text + " <a href='" + desc.meta.documentationURL + "'>documentation</a>"
          }
          element[0].innerHTML = text + "<pre class='_endev_json_'>" + syntaxHighlight(JSON.stringify(res, undefined, 2)) + "</pre>";
        });
      }
    }
  }
}])
          
//The basic run
endevModule.run(["$rootScope","$document","$templateCache",function($rootScope,$document,$templateCache){
  $rootScope.Date = Date;
  $rootScope.Math = Math;
  $rootScope.$now = function() {
    return new Date();
  }
  $rootScope.$endevAnnotation = false;
  $rootScope.$endevErrors = []
  if(window.endev && window.endev.logic) angular.extend($rootScope,window.endev.logic);
  angular.element($document[0].body).attr("ng-class","{'__endev_annotation_on__':$endevAnnotation}");
  angular.element($document[0].body).append($templateCache.get('endevHelper.tpl.html'));
  if(!(window.endev && !window.endev.showHelper)){
    $rootScope.$endevShowHelper = true;
  }

}]);
