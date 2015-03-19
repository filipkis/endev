/*! endev 0.2.0 2015-03-19 */
//! makumba-angular.js
//! version: 0.1.0
//! authors: Filip Kis
//! license: MIT 

(function (window,_,document,undefined) {
angular.module('endev-templates', ['endevHelper.tpl.html']);

angular.module("endevHelper.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("endevHelper.tpl.html",
    "<style>\n" +
    "  #__endev_helper__ {  \n" +
    "    position: fixed;  \n" +
    "    bottom: 0;  \n" +
    "    left: 0;  \n" +
    "    right: 0;  \n" +
    "    background: #E0E0E0;  \n" +
    "    border-top: 1px solid #929292;  \n" +
    "    padding: 5px;  \n" +
    "    font-family: sans-serif;  \n" +
    "    font-size: 12px;  \n" +
    "  }  \n" +
    "\n" +
    "  .__endev_annotation_on__ .__endev_annotated__ { \n" +
    "    outline: 1px solid rgba(255,0,0,0.5); \n" +
    "    /*border: 1px solid rgba(255,0,0,0.5); */\n" +
    "    padding-top: 15px; \n" +
    "    margin-top:5px;\n" +
    "    display:block; \n" +
    "  } \n" +
    "\n" +
    "  .__endev_annotation_on__ tbody.__endev_annotated__ {\n" +
    "    display: table-row-group;\n" +
    "  }\n" +
    "  .__endev_annotation__ { \n" +
    "    display: none; \n" +
    "  }\n" +
    "  .__endev_annotation_on__ .__endev_annotated__ > .__endev_annotation__ { \n" +
    "    display: block; \n" +
    "    position: absolute; \n" +
    "    margin-top: -22px; \n" +
    "    font-size: 10px; \n" +
    "    font-family: monospace; \n" +
    "    background: #FFFFD1; \n" +
    "    color: #666; \n" +
    "    padding: 1px 3px; \n" +
    "    border: 1px dashed rgba(255,0,0,0.5); \n" +
    "    margin-left: 5px; \n" +
    "    cursor: pointer; \n" +
    "  } \n" +
    "  .__endev_annotated__ > .__endev_annotation__:hover { \n" +
    "    background: rgba(255,255,125,0.9); \n" +
    "  } \n" +
    "  .__endev_annotated__ > .__endev_list_item_annotated__ { \n" +
    "    outline: 1px dashed rgba(255,0,0,0.5); \n" +
    "  } \n" +
    "  table.__endev_annotated__, thead.__endev_annotated__, tbody.__endev_annotated__, tfoot.__endev_annotated__  { \n" +
    "    /*border: 1px solid red;*/\n" +
    "    padding-top: 10px; \n" +
    "    margin-top: 10px; \n" +
    "  } \n" +
    "  table .__endev_annotated__ > .__endev_annotation__ { \n" +
    "    margin-top: -1px; \n" +
    "  }\n" +
    "</style>\n" +
    "<div id=\"__endev_helper__\">\n" +
    "  Endev Tools:\n" +
    "  <button ng-click=\"$endevAnnotation = !$endevAnnotation\">Annotations {{$endevAnnotation ? 'off' : 'on'}}</button>\n" +
    "  <span style=\"color:red\">{{$endevErrors[$endevErrors.length-1].description}}</span>\n" +
    "</div>");
}]);

angular.module("endev-data-tag",[])
.directive("data", ['$rootScope','$http','$injector','$interval','$timeout','$log','$interpolate','Expr', function($rootScope,$http,$injector,$interval,$timeout,$log,$interpolate,Expr) {
  function EndevLog() {

  }

  function EndevQuery() {

  }
  return {
    priority: 1001,
    restrict:'E',
    scope:true,
    link: function (scope,element,attrs) {

      var delay = attrs.delay ? scope.$eval(attrs.delay) : 0;

      scope.$eval(attrs.pending); 
      scope.$pending = true;
      scope.$error = null;
      scope.$success = false;

      var count = 0;

      var execute = function() {

        if (!scope.$parent.$pending) {

          var from = $interpolate(attrs.from,false,null,true)(scope)
          var type = from.split(" ")[0];
          var provider = attrs.provider ? $injector.get('$endev' + attrs.provider[0].toUpperCase() + attrs.provider.slice(1)) :
            from.search(/http(s)?:\/\//) == 0 ? $injector.get("$endevRest") : $injector.get('$endevYql');
          var label = attrs.from.split(" ")[1];
          var params = attrs.where ? attrs.where.split(OPERATORS_REGEX).map( function(expr) {
              var exp = new Expr(expr);
              exp.value = scope.$eval(exp.rhs);
              exp.attribute = exp.lhs.replace(new RegExp("^" + label + ".", "g"),"");
              return exp;
            }) : [];

          scope.$eval(attrs.pending); 
          scope.$pending = true;
          scope.$error = null;
          scope.$success = false;

          if(attrs.log) {
            var log = new EndevLog();
            log.query = new EndevQuery();
            log.query.from = from;
            log.query.where = attrs.where;
          }

          var queryParameters = _.defaults({from:type,where:attrs.where,params:params},_.extendOwn({},_.pick(attrs,function(value,key){ return key.indexOf('$') !=0 })));
          provider.query(queryParameters).then(function(data) {
            scope[label] = data;
            scope.$eval(attrs.success);
            scope.$pending = false;
            scope.$success = true;

            if(attrs.log) {
              log.results = scope[label]
              $log.info(log);
             }
          }).catch(function(data, status, headers, config) {
            scope.$eval(attrs.error);
            scope.$pending = false;
            scope.$success = false;
            scope.$error = data.description;
            if(attrs.retry) {
              scope.$pending = true;
              $timeout(execute,delay);
            }
            if(attrs.log) {
              log.data = data;
              $log.error(log);
            }
          });

          if (count == 0) {
            params.forEach( function(param) {
              scope.$watch(param.rhs,execute);
            });
            attrs.$observe("from",execute)
          }
          count ++;
        }else{
          // scope.$watch(scope.$parent.$pending, function(newValue,oldValue) {
          //  if (newValue != oldValue && !newValue) {
          //    execute();
          //  }
          // }); 
          // TODO: Fix hack!
          $timeout(execute,100);
        }

      };

      $timeout(execute,delay);

      if(attrs.refresh) {
        $interval(execute,attrs.refresh);
      }
      
    }
  }
}]);
	
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
      }
      scope.$watch(label,function(value){
        if(value && attrs.loaded){
          scope.$eval(attrs.loaded);
        }
      });
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
  if(window.endev.logic) angular.extend($rootScope,window.endev.logic);
  angular.element($document[0].body).attr("ng-class","{'__endev_annotation_on__':$endevAnnotation}");
  angular.element($document[0].body).append($templateCache.get('endevHelper.tpl.html'));
}]);

endevModule.directive("list",['$compile',function($compile){
  return {
    terminal: true,
    priority: 1000, 
    compile: function(tElement,tAttributes) {
      tElement.parent().prepend("<span class='__endev_annotation__' ng-if='$annotation'>" + tAttributes.list + "</span>");
      tAttributes.$set("ng-class","{'__endev_list_item_annotated__':$annotation}")
      tAttributes.$set("ng-repeat",tAttributes.list);
      tElement.removeAttr("data-list");
      return {
        pre: function preLink(scope, iElement, iAttrs, controller) {  },
        post: function postLink(scope, iElement, iAttrs, controller) {  
          var element = $compile(iElement)(scope);
          scope.$watch('$annotation',function(newValue,oldValue){
            if(newValue){
              element.parent().addClass("__endev_annotated__");
              angular.element(element.parent().children()[0]).removeClass("ng-hide");
            } else {
              element.parent().removeClass("__endev_annotated__");
              angular.element(element.parent().children()[0]).addClass("ng-hide");
            }
          });
        }
      };
    }
  }
}]);

endevModule.directive("object",["$q",function($q){
  return {
    scope: true,
    compile: function(tElement, tAttributes) {
      tElement.prepend("<span class='__endev_annotation__' ng-if='$annotation'>" + tAttributes.object + "</span>");
      return {
        pre: function preLink(scope,element,attrs) {},
        post: function postLink(scope,element,attrs) {
          attrs.$addClass("ng-hide");
          var lhs = attrs.object.split('=')[0].trim();
          var rhs = attrs.object.split('=')[1].trim();
          // var path = rhs.match(PATH_REGEX)[0];
          // if (rhs.charAt(path.length)==="(") {
          //   if (path.lastIndexOf(".") > 0) {
          //     path = path.substring(0,path.lastIndexOf("."));
          //   } else {
          //     path = null;
          //   }
          // }
          // if (path) {
          //   console.log(path)
          //   scope.$watch(path,function(newValue,oldValue){
          //     eval();
          //   });
          // }
          function eval() {
            $q.when(scope.$eval(rhs)).then(function(value){
              if(value && value["$bindTo"]) {
                value.$bindTo(scope,lhs);
              } else {
                scope[lhs] = value;
              }
            });
          }
          scope.$watch(lhs,function(newValue,oldValue){
            if(newValue) {
              attrs.$removeClass("ng-hide");
            } else {
              attrs.$addClass("ng-hide");
            }
          });
          scope.$watch('$annotation',function(newValue,oldValue){
            if(newValue){
              attrs.$addClass("__endev_annotated__");
            } else {
              attrs.$removeClass("__endev_annotated__");
            }
          });
          element.on("click",function(){
            console.log("Clicked object");
          });

          var unbind;
          scope.$watch(rhs,function(newValue,oldValue){
            $q.when(newValue).then(function(value){
              if(value && value["$bindTo"]) {
                if(unbind) {
                  unbind();
                }
                value.$bindTo(scope,lhs).then(function(unb){
                  unbind = unb;
                });
              } else {
                scope[lhs] = value;
              }
            });
          });
          // eval();
        }
      }
    }
  }
}]);

//Firebase dependent features
if ($injector.has('$firebaseObject')) {
  endevModule.run(["$rootScope","$firebaseArray","$firebaseObject","$q",function($rootScope,$firebaseArray,$firebaseObject,$q) {
    $rootScope.from =  _.memoize(function(path) {
      var ref = new Firebase("https://endev.firebaseio.com");
      // var sync = $firebase(ref.child(path),{
      //   arrayFactory: $FirebaseArray.$extendFactory({
      //     findOrNew: _.memoize(function(find,init) {
      //       var deferred = $q.defer();
      //       this.$list.$loaded().then(function(list){
      //         var result = _.findWhere(list,find);
      //         if(!result) {
      //           result = _.extend(find,init);
      //           result.$new = true;
      //         }
      //         deferred.resolve(result);
      //       });
      //       return result;
      //     },JSON.stringify),
      //     findOrCreate: _.memoize(function(find,init) {
      //       var deferred = $q.defer();
      //       this.$list.$loaded().then(function(list){
      //         var result = _.findWhere(list,find);
      //         if(!result) {
      //           list.$add(_.extend(find,init)).then(function(ref){
      //             $firebase(ref).$asObject().$loaded().then(function(object){
      //               _.extend(object,_.pick(init,function(value,key){
      //                 return !object[key] && angular.isArray(value) && value.length === 0;
      //               }));
      //               deferred.resolve(object);
      //             });
      //           });
      //         }else{
      //           var ref = new Firebase(list.$inst().$ref().toString() + "/" + result.$id);
      //           $firebase(ref).$asObject().$loaded().then(function(object){
      //             _.extend(object,_.pick(init,function(value,key){
      //               return !object[key] && angular.isArray(value) && value.length === 0;
      //             }));
      //             deferred.resolve(object);
      //           });
      //         }
      //       });
      //       return deferred.promise;
      //     },JSON.stringify),
      //     insert: function(obj) {
      //       this.$list.$add(obj);
      //     },
      //     remove: function(obj) {
      //       this.$list.$remove(obj);
      //     }
      //   }),
      //   objectFactory: $FirebaseArray.$extendFactory({
      //     findOrNew: function(find,init) {
      //       var deferred = $q.defer();
      //       this.$loaded().then(function(list){
      //         var result = _.findWhere(list,find);
      //         if(!result) {
      //           result = _.extend(find,init);
      //           result.$new = true;
      //         }
      //         deferred.resolve(result);
      //       });
      //       return result;
      //     },
      //     findOrCreate: function(find,init) {
      //       var deferred = $q.defer();
      //       this.$list.$loaded().then(function(list){
      //         var result = _.findWhere(list,find);
      //         if(!result) {
      //           list.$add(_.extend(find,init)).then(function(ref){
      //             deferred.resolve($firebase(ref).$asObject());
      //           });
      //         }else{
      //           deferred.resolve(result);
      //         }
      //       });
      //       return deferred.promise;
      //     },
      //     insert: function(obj) {
      //       this.$list.$add(obj);
      //     },
      //     remove: function(obj) {
      //       this.$list.$remove(obj);
      //     }
      //   })
      // });
      // return sync.$asArray();
      
    });

    // Array.prototype.findOrNew = _.memoize(function(find,init){     
    //   var result = _.findWhere(this,find);
    //   if(!result) {
    //     result = _.extend(find,init)
    //     result.$new = true;
    //   }
    //   return result;
    // },hasherWithThis);

    // Array.prototype.findOrCreate = _.memoize(function(find,init){
    //   var result = _.findWhere(this,find);
    //   if(!result) {
    //     result = _.extend(find,init)
    //     this.push(result);
    //   }
    //   return result;
    // },hasherWithThis);

    // Array.prototype.insert = function(obj) {
    //   obj['$new'] = undefined;
    //   obj['$deleted'] = undefined;
    //   obj['createdAt'] = new Date().getTime();
    //   this.push(obj);
    // }

    // Array.prototype.remove = function(obj) {
    //   this.splice(this.indexOf(obj),1);
    //   obj['$new'] = true;
    //   obj['$deleted'] = true;
    // }

  }]);
}
endevModule.service("$endevProvider",['$injector', function($injector){
  return {
    get: function(provider,type){
      return provider ? $injector.get('$endev' + provider[0].toUpperCase() + provider.slice(1)) :
        type.search(/http(s)?:\/\//) == 0 ? $injector.get("$endevRest") : $injector.get('$endevYql');
    }
  }
}]);

endevModule.service("$endevYql", ['$http','$q', function($http,$q){ 
  return {
    query: function(attrs,extra,callback) {
      var result = $q.defer()
      if(attrs.parentLabel){
        var tmp = _.reduce(attrs.from.substring(attrs.parentLabel.length+1).split("."),function(memo,id){
          console.log("Loging path:",memo,id);
          return angular.isDefined(memo) ? memo[id] : null;
        },attrs.parentObject)
        if(callback && angular.isFunction(callback)) callback(tmp)
        else result.resolve(tmp);
      }else{
        var where = attrs.where;
        for(var i = 0; i<attrs.params.length; i++) {
          where = where.replace(attrs.params[i].expression, attrs.params[i].replace("'" + attrs.params[i].value + "'"));
        }
        var query;
        if(attrs.use) {
          query = "use '" + attrs.use + "' as tmpTable; select * from tmpTable";
        } else {
          query = "select * from " + attrs.from;
        }
        if(where) query += " where " + where;
        $http.get("https://query.yahooapis.com/v1/public/yql?q=" 
          + encodeURIComponent(query) 
          + "&diagnostics=true&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys&format=json")
          .success(function(data){
            var d = data.query.results;
            if(attrs.use && attrs.from.indexOf(".")>=0) {
              d = _.reduce(attrs.from.substring(attrs.from.indexOf(".")+1).split("."),function(memo,id){
                return angular.isDefined(memo) ? memo[id] : null;
              },data.query.results)
            }
            console.log("Data:",d);
            result.resolve(d);
          }).error(function(data){
            result.reject(data.error);
          });
      }
      return result.promise
    }
  }
}]);

endevModule.service("$endevRest", ['$http','$interpolate','$q', function($http,$interpolate,$q){ 

  function prependTransform(defaults, transform) {
    // We can't guarantee that the transform transformation is an array
    transform = angular.isArray(transform) ? transform : [transform];
    // Append the new transformation to the defaults
    return transform.concat(defaults);
  }

  return {
    query: function(attrs) {
      var where = "";
      for(var i = 0; i<attrs.params.length; i++) {
        where += attrs.params[i].attribute + "=" + encodeURIComponent(attrs.params[i].value);
        if(i < attrs.params.length-1) {
          where += "&";
        }
      }
      var config = {
        headers: angular.isString(attrs.headers) ? angular.fromJson(attrs.headers) : 
          angular.isObject(attrs.headers) ? attrs.headers : undefined,
        transformResponse: prependTransform($http.defaults.transformResponse, function(data, headersGetter) {
          if (headersGetter()['content-type']=="application/atom+xml") {
            var x2js = new X2JS();
            return x2js.xml_str2json(data);
          } else {
            return data;
          }
        })
      }
      var url = attrs.from
      if (url.indexOf('?') != -1) {
        url = url + "&" + where;
      } else {
        url = url + "?" + where;
      }
      var result = $q.defer()
      $http.get(url, config)
        .success(function(data){
          result.resolve(data);
        }).error(function(data){
          result.reject(data);
        });
      return result.promise;
    }
  }
}]);

//Firebase dependent features
if ($injector.has('$firebaseObject')) {
  
  endevModule.service("$endevFirebase",['$q','$firebaseObject','$firebaseArray', function($q,$firebaseObject,$firebaseArray){
    var ref = new Firebase("https://endev.firebaseio.com");
    
    function getObjectRef(type,parentLabel,parentObject,parentData){
      if(parentData){
        // var key = _.findKey(parentData,function(value){return value == parentObject}) 
        var key = parentObject.$id 
        path = parentLabel ? key + "/" + type.substring(parentLabel.length + 1) : key ;
        console.log("Path with parent:",path);
        return objectRef(parentData.$ref,path);
      } else {
        return objectRef(ref,type);
      }
    }

    var objectRef = function(ref,path){
      if(path) return ref.child(path.replace(".","/"));
      return null;
    };

    var unwatch = []

    var unwatchCache = function(callback){
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

    function filterData(data,filter){
      var results = []
      // var results = {}
      results.$endevProviderType = "firebase";
      results.$ref = data.$ref()
      _.each(data,function(value, key){
        // if(!key.indexOf("$")!==0 && _.isMatchDeep(value,filter)){
        if(_.isMatchDeep(value,filter)){
          // results[key] = value;
          results.push(value);
        }
      });
      return results;
      // return _.filter(_.reject(data,function(value,key){return key.indexOf("$")===0}),_.matcherDeep(filter))
    }

    return {
      query: function(attrs,extraAttrs,callback) {
        var result = $q.defer();

        if(unwatchCache(callback).unwatch) unwatchCache(callback).unwatch();
        var objRef = getObjectRef(attrs.from,attrs.parentLabel,attrs.parentObject,attrs.parentData);
        // TODO  need to add a watcher for the result and then update the value somehow
        $firebaseArray(objRef).$loaded().then(function(data){

          console.log("Data:",data)
          var object = filterData(data,attrs.filter);
          if(object.length === 0 && attrs.autoInsert) {
            data.$add(attrs.filter)
          }
          object.$endevRef = objRef;
          console.log("Object:",object)
          if(callback && angular.isFunction(callback)) callback(object,data);
          else result.resolve(object);
          unwatchCache(callback).unwatch = data.$watch(function(){
            console.log("Data changed:", data, attrs.where);
            object = filterData(data,attrs.filter);               
            if(callback && angular.isFunction(callback)) callback(object);
          })
        });  

        return result.promise;
      }, 
      insert: function(attrs) {
        var result = $q.defer();

        var objRef = getObjectRef(attrs.insertInto,attrs.parentLabel,attrs.parentObject,attrs.parentData);

        $firebaseArray(objRef).$loaded().then(function(list){
          list.$add(attrs.newObject).then(function(ref){
            $firebaseArray(ref).$loaded().then(function(value){
              result.resolve(value);
            });
          });
        })
        return result.promise;
      },
      remove: function(attrs) {
        console.log("Removing:",attrs.newObject);
        var objRef = getObjectRef(attrs.removeFrom,attrs.parentLabel,attrs.parentObject,attrs.parentData);
        $firebaseObject(objRef).$loaded().then(function(object){
          // var key = _.findKey(object,function(value){return _.isMatchDeep(value,attrs.newObject)})
          $firebaseObject(object.$ref().child(attrs.newObject.$id)).$remove();
        })

      },
      bind: function(attrs) {
        var objRef = getObjectRef(attrs.from,attrs.parentLabel,attrs.parentObject,attrs.parentData);
        if(objRef) $firebaseObject(objRef).$bindTo(attrs.scope,attrs.label)
      }

    }
  }]);
}
/*
// Use to debug catching
_.memoize = function(func, hasher) {
  console.log('Created memoized function:');
  console.log(func.toString().substring(0,func.toString().indexOf("\n")))
  var memoize = function(key) {
    var cache = memoize.cache;
    var address = '' + (hasher ? hasher.apply(this, arguments) : key);
    if (!_.has(cache, address)) {
      console.log("Executed:");
      cache[address] = func.apply(this, arguments);
    } else {
      console.log("From cache:")
    }
    console.log(address);
    console.log(arguments);
    console.log(this);
    return cache[address];
  };
  memoize.cache = {};
  return memoize;
};*/

// Deep merge
_.merge = function(obj, depth) {
  var parentRE = /#{\s*?_\s*?}/,
  slice = Array.prototype.slice;
 
  _.each(slice.call(arguments, 1), function(source) {
    for (var prop in source) {
      if (_.isNull(obj[prop]) || _.isUndefined(obj[prop]) || _.isFunction(obj[prop]) || _.isNull(source[prop]) || _.isDate(source[prop])) {
        obj[prop] = source[prop];
      }
      else if (_.isString(source[prop]) && parentRE.test(source[prop])) {
        if (_.isString(obj[prop])) {
          obj[prop] = source[prop].replace(parentRE, obj[prop]);
        }
      }
      else if (_.isArray(obj[prop]) || _.isArray(source[prop])){
        if (!_.isArray(obj[prop]) || !_.isArray(source[prop])){
          throw new Error('Trying to combine an array with a non-array (' + prop + ')');
        } else {
          obj[prop] = _.reject(_.merge(_.clone(obj[prop]), source[prop]), function (item) { return _.isNull(item);});
        }
      }
      else if (_.isObject(obj[prop]) || _.isObject(source[prop])){
        if (!_.isObject(obj[prop]) || !_.isObject(source[prop])){
          throw new Error('Trying to combine an object with a non-object (' + prop + ')');
        } else {
          obj[prop] = _.merge(_.clone(obj[prop]), source[prop]);
        }
      } else {
        obj[prop] = source[prop];
      }
    }
  });
  return obj;
};

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

_.matcherDeep = function(attrs) {
  return function(obj) {
    return _.isMatchDeep(obj,attrs);
  } 
} 

var hasherWithThis = function() {
  return JSON.stringify({this:this,args:arguments});
}; 
/*
 Copyright 2011-2013 Abdulla Abdurakhmanov
 Original sources are available at https://code.google.com/p/x2js/

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */

function X2JS(config) {
	'use strict';
		
	var VERSION = "1.1.5";
	
	config = config || {};
	initConfigDefaults();
	initRequiredPolyfills();
	
	function initConfigDefaults() {
		if(config.escapeMode === undefined) {
			config.escapeMode = true;
		}
		config.attributePrefix = config.attributePrefix || "_";
		config.arrayAccessForm = config.arrayAccessForm || "none";
		config.emptyNodeForm = config.emptyNodeForm || "text";
		if(config.enableToStringFunc === undefined) {
			config.enableToStringFunc = true; 
		}
		config.arrayAccessFormPaths = config.arrayAccessFormPaths || []; 
		if(config.skipEmptyTextNodesForObj === undefined) {
			config.skipEmptyTextNodesForObj = true;
		}
		if(config.stripWhitespaces === undefined) {
			config.stripWhitespaces = true;
		}
		config.datetimeAccessFormPaths = config.datetimeAccessFormPaths || [];
	}

	var DOMNodeTypes = {
		ELEMENT_NODE 	   : 1,
		TEXT_NODE    	   : 3,
		CDATA_SECTION_NODE : 4,
		COMMENT_NODE	   : 8,
		DOCUMENT_NODE 	   : 9
	};
	
	function initRequiredPolyfills() {
		function pad(number) {
	      var r = String(number);
	      if ( r.length === 1 ) {
	        r = '0' + r;
	      }
	      return r;
	    }
		// Hello IE8-
		if(typeof String.prototype.trim !== 'function') {			
			String.prototype.trim = function() {
				return this.replace(/^\s+|^\n+|(\s|\n)+$/g, '');
			}
		}
		if(typeof Date.prototype.toISOString !== 'function') {
			// Implementation from http://stackoverflow.com/questions/2573521/how-do-i-output-an-iso-8601-formatted-string-in-javascript
			Date.prototype.toISOString = function() {
		      return this.getUTCFullYear()
		        + '-' + pad( this.getUTCMonth() + 1 )
		        + '-' + pad( this.getUTCDate() )
		        + 'T' + pad( this.getUTCHours() )
		        + ':' + pad( this.getUTCMinutes() )
		        + ':' + pad( this.getUTCSeconds() )
		        + '.' + String( (this.getUTCMilliseconds()/1000).toFixed(3) ).slice( 2, 5 )
		        + 'Z';
		    };
		}
	}
	
	function getNodeLocalName( node ) {
		var nodeLocalName = node.localName;			
		if(nodeLocalName == null) // Yeah, this is IE!! 
			nodeLocalName = node.baseName;
		if(nodeLocalName == null || nodeLocalName=="") // =="" is IE too
			nodeLocalName = node.nodeName;
		return nodeLocalName;
	}
	
	function getNodePrefix(node) {
		return node.prefix;
	}
		
	function escapeXmlChars(str) {
		if(typeof(str) == "string")
			return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g, '&#x2F;');
		else
			return str;
	}

	function unescapeXmlChars(str) {
		return str.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#x27;/g, "'").replace(/&#x2F;/g, '\/');
	}
	
	function toArrayAccessForm(obj, childName, path) {
		switch(config.arrayAccessForm) {
		case "property":
			if(!(obj[childName] instanceof Array))
				obj[childName+"_asArray"] = [obj[childName]];
			else
				obj[childName+"_asArray"] = obj[childName];
			break;		
		/*case "none":
			break;*/
		}
		
		if(!(obj[childName] instanceof Array) && config.arrayAccessFormPaths.length > 0) {
			var idx = 0;
			for(; idx < config.arrayAccessFormPaths.length; idx++) {
				var arrayPath = config.arrayAccessFormPaths[idx];
				if( typeof arrayPath === "string" ) {
					if(arrayPath == path)
						break;
				}
				else
				if( arrayPath instanceof RegExp) {
					if(arrayPath.test(path))
						break;
				}				
				else
				if( typeof arrayPath === "function") {
					if(arrayPath(obj, childName, path))
						break;
				}
			}
			if(idx!=config.arrayAccessFormPaths.length) {
				obj[childName] = [obj[childName]];
			}
		}
	}
	
	function fromXmlDateTime(prop) {
		// Implementation based up on http://stackoverflow.com/questions/8178598/xml-datetime-to-javascript-date-object
		// Improved to support full spec and optional parts
		var bits = prop.split(/[-T:+Z]/g);
		
		var d = new Date(bits[0], bits[1]-1, bits[2]);			
		var secondBits = bits[5].split("\.");
		d.setHours(bits[3], bits[4], secondBits[0]);
		if(secondBits.length>1)
			d.setMilliseconds(secondBits[1]);

		// Get supplied time zone offset in minutes
		if(bits[6] && bits[7]) {
			var offsetMinutes = bits[6] * 60 + Number(bits[7]);
			var sign = /\d\d-\d\d:\d\d$/.test(prop)? '-' : '+';

			// Apply the sign
			offsetMinutes = 0 + (sign == '-'? -1 * offsetMinutes : offsetMinutes);

			// Apply offset and local timezone
			d.setMinutes(d.getMinutes() - offsetMinutes - d.getTimezoneOffset())
		}
		else
			if(prop.indexOf("Z", prop.length - 1) !== -1) {
				d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), d.getMinutes(), d.getSeconds(), d.getMilliseconds()));					
			}

		// d is now a local time equivalent to the supplied time
		return d;
	}
	
	function checkFromXmlDateTimePaths(value, childName, fullPath) {
		if(config.datetimeAccessFormPaths.length > 0) {
			var path = fullPath.split("\.#")[0];
			var idx = 0;
			for(; idx < config.datetimeAccessFormPaths.length; idx++) {
				var dtPath = config.datetimeAccessFormPaths[idx];
				if( typeof dtPath === "string" ) {
					if(dtPath == path)
						break;
				}
				else
				if( dtPath instanceof RegExp) {
					if(dtPath.test(path))
						break;
				}				
				else
				if( typeof dtPath === "function") {
					if(dtPath(obj, childName, path))
						break;
				}
			}
			if(idx!=config.datetimeAccessFormPaths.length) {
				return fromXmlDateTime(value);
			}
			else
				return value;
		}
		else
			return value;
	}

	function parseDOMChildren( node, path ) {
		if(node.nodeType == DOMNodeTypes.DOCUMENT_NODE) {
			var result = new Object;
			var nodeChildren = node.childNodes;
			// Alternative for firstElementChild which is not supported in some environments
			for(var cidx=0; cidx <nodeChildren.length; cidx++) {
				var child = nodeChildren.item(cidx);
				if(child.nodeType == DOMNodeTypes.ELEMENT_NODE) {
					var childName = getNodeLocalName(child);
					result[childName] = parseDOMChildren(child, childName);
				}
			}
			return result;
		}
		else
		if(node.nodeType == DOMNodeTypes.ELEMENT_NODE) {
			var result = new Object;
			result.__cnt=0;
			
			var nodeChildren = node.childNodes;
			
			// Children nodes
			for(var cidx=0; cidx <nodeChildren.length; cidx++) {
				var child = nodeChildren.item(cidx); // nodeChildren[cidx];
				var childName = getNodeLocalName(child);
				
				if(child.nodeType!= DOMNodeTypes.COMMENT_NODE) {
					result.__cnt++;
					if(result[childName] == null) {
						result[childName] = parseDOMChildren(child, path+"."+childName);
						toArrayAccessForm(result, childName, path+"."+childName);					
					}
					else {
						if(result[childName] != null) {
							if( !(result[childName] instanceof Array)) {
								result[childName] = [result[childName]];
								toArrayAccessForm(result, childName, path+"."+childName);
							}
						}
						(result[childName])[result[childName].length] = parseDOMChildren(child, path+"."+childName);
					}
				}								
			}
			
			// Attributes
			for(var aidx=0; aidx <node.attributes.length; aidx++) {
				var attr = node.attributes.item(aidx); // [aidx];
				result.__cnt++;
				result[config.attributePrefix+attr.name]=attr.value;
			}
			
			// Node namespace prefix
			var nodePrefix = getNodePrefix(node);
			if(nodePrefix!=null && nodePrefix!="") {
				result.__cnt++;
				result.__prefix=nodePrefix;
			}
			
			if(result["#text"]!=null) {				
				result.__text = result["#text"];
				if(result.__text instanceof Array) {
					result.__text = result.__text.join("\n");
				}
				if(config.escapeMode)
					result.__text = unescapeXmlChars(result.__text);
				if(config.stripWhitespaces)
					result.__text = result.__text.trim();
				delete result["#text"];
				if(config.arrayAccessForm=="property")
					delete result["#text_asArray"];
				result.__text = checkFromXmlDateTimePaths(result.__text, childName, path+"."+childName);
			}
			if(result["#cdata-section"]!=null) {
				result.__cdata = result["#cdata-section"];
				delete result["#cdata-section"];
				if(config.arrayAccessForm=="property")
					delete result["#cdata-section_asArray"];
			}
			
			if( result.__cnt == 1 && result.__text!=null  ) {
				result = result.__text;
			}
			else
			if( result.__cnt == 0 && config.emptyNodeForm=="text" ) {
				result = '';
			}
			else
			if ( result.__cnt > 1 && result.__text!=null && config.skipEmptyTextNodesForObj) {
				if( (config.stripWhitespaces && result.__text=="") || (result.__text.trim()=="")) {
					delete result.__text;
				}
			}
			delete result.__cnt;			
			
			if( config.enableToStringFunc && (result.__text!=null || result.__cdata!=null )) {
				result.toString = function() {
					return (this.__text!=null? this.__text:'')+( this.__cdata!=null ? this.__cdata:'');
				};
			}
			
			return result;
		}
		else
		if(node.nodeType == DOMNodeTypes.TEXT_NODE || node.nodeType == DOMNodeTypes.CDATA_SECTION_NODE) {
			return node.nodeValue;
		}	
	}
	
	function startTag(jsonObj, element, attrList, closed) {
		var resultStr = "<"+ ( (jsonObj!=null && jsonObj.__prefix!=null)? (jsonObj.__prefix+":"):"") + element;
		if(attrList!=null) {
			for(var aidx = 0; aidx < attrList.length; aidx++) {
				var attrName = attrList[aidx];
				var attrVal = jsonObj[attrName];
				if(config.escapeMode)
					attrVal=escapeXmlChars(attrVal);
				resultStr+=" "+attrName.substr(config.attributePrefix.length)+"='"+attrVal+"'";
			}
		}
		if(!closed)
			resultStr+=">";
		else
			resultStr+="/>";
		return resultStr;
	}
	
	function endTag(jsonObj,elementName) {
		return "</"+ (jsonObj.__prefix!=null? (jsonObj.__prefix+":"):"")+elementName+">";
	}
	
	function endsWith(str, suffix) {
	    return str.indexOf(suffix, str.length - suffix.length) !== -1;
	}
	
	function jsonXmlSpecialElem ( jsonObj, jsonObjField ) {
		if((config.arrayAccessForm=="property" && endsWith(jsonObjField.toString(),("_asArray"))) 
				|| jsonObjField.toString().indexOf(config.attributePrefix)==0 
				|| jsonObjField.toString().indexOf("__")==0
				|| (jsonObj[jsonObjField] instanceof Function) )
			return true;
		else
			return false;
	}
	
	function jsonXmlElemCount ( jsonObj ) {
		var elementsCnt = 0;
		if(jsonObj instanceof Object ) {
			for( var it in jsonObj  ) {
				if(jsonXmlSpecialElem ( jsonObj, it) )
					continue;			
				elementsCnt++;
			}
		}
		return elementsCnt;
	}
	
	function parseJSONAttributes ( jsonObj ) {
		var attrList = [];
		if(jsonObj instanceof Object ) {
			for( var ait in jsonObj  ) {
				if(ait.toString().indexOf("__")== -1 && ait.toString().indexOf(config.attributePrefix)==0) {
					attrList.push(ait);
				}
			}
		}
		return attrList;
	}
	
	function parseJSONTextAttrs ( jsonTxtObj ) {
		var result ="";
		
		if(jsonTxtObj.__cdata!=null) {										
			result+="<![CDATA["+jsonTxtObj.__cdata+"]]>";					
		}
		
		if(jsonTxtObj.__text!=null) {			
			if(config.escapeMode)
				result+=escapeXmlChars(jsonTxtObj.__text);
			else
				result+=jsonTxtObj.__text;
		}
		return result;
	}
	
	function parseJSONTextObject ( jsonTxtObj ) {
		var result ="";

		if( jsonTxtObj instanceof Object ) {
			result+=parseJSONTextAttrs ( jsonTxtObj );
		}
		else
			if(jsonTxtObj!=null) {
				if(config.escapeMode)
					result+=escapeXmlChars(jsonTxtObj);
				else
					result+=jsonTxtObj;
			}
		
		return result;
	}
	
	function parseJSONArray ( jsonArrRoot, jsonArrObj, attrList ) {
		var result = ""; 
		if(jsonArrRoot.length == 0) {
			result+=startTag(jsonArrRoot, jsonArrObj, attrList, true);
		}
		else {
			for(var arIdx = 0; arIdx < jsonArrRoot.length; arIdx++) {
				result+=startTag(jsonArrRoot[arIdx], jsonArrObj, parseJSONAttributes(jsonArrRoot[arIdx]), false);
				result+=parseJSONObject(jsonArrRoot[arIdx]);
				result+=endTag(jsonArrRoot[arIdx],jsonArrObj);						
			}
		}
		return result;
	}
	
	function parseJSONObject ( jsonObj ) {
		var result = "";	

		var elementsCnt = jsonXmlElemCount ( jsonObj );
		
		if(elementsCnt > 0) {
			for( var it in jsonObj ) {
				
				if(jsonXmlSpecialElem ( jsonObj, it) )
					continue;			
				
				var subObj = jsonObj[it];						
				
				var attrList = parseJSONAttributes( subObj )
				
				if(subObj == null || subObj == undefined) {
					result+=startTag(subObj, it, attrList, true);
				}
				else
				if(subObj instanceof Object) {
					
					if(subObj instanceof Array) {					
						result+=parseJSONArray( subObj, it, attrList );					
					}
					else if(subObj instanceof Date) {
						result+=startTag(subObj, it, attrList, false);
						result+=subObj.toISOString();
						result+=endTag(subObj,it);
					}
					else {
						var subObjElementsCnt = jsonXmlElemCount ( subObj );
						if(subObjElementsCnt > 0 || subObj.__text!=null || subObj.__cdata!=null) {
							result+=startTag(subObj, it, attrList, false);
							result+=parseJSONObject(subObj);
							result+=endTag(subObj,it);
						}
						else {
							result+=startTag(subObj, it, attrList, true);
						}
					}
				}
				else {
					result+=startTag(subObj, it, attrList, false);
					result+=parseJSONTextObject(subObj);
					result+=endTag(subObj,it);
				}
			}
		}
		result+=parseJSONTextObject(jsonObj);
		
		return result;
	}
	
	this.parseXmlString = function(xmlDocStr) {
		var isIEParser = window.ActiveXObject || "ActiveXObject" in window;
		if (xmlDocStr === undefined) {
			return null;
		}
		var xmlDoc;
		if (window.DOMParser) {
			var parser=new window.DOMParser();			
			var parsererrorNS = null;
			// IE9+ now is here
			if(!isIEParser) {
				try {
					parsererrorNS = parser.parseFromString("INVALID", "text/xml").childNodes[0].namespaceURI;
				}
				catch(err) {					
					parsererrorNS = null;
				}
			}
			try {
				xmlDoc = parser.parseFromString( xmlDocStr, "text/xml" );
				if( parsererrorNS!= null && xmlDoc.getElementsByTagNameNS(parsererrorNS, "parsererror").length > 0) {
					//throw new Error('Error parsing XML: '+xmlDocStr);
					xmlDoc = null;
				}
			}
			catch(err) {
				xmlDoc = null;
			}
		}
		else {
			// IE :(
			if(xmlDocStr.indexOf("<?")==0) {
				xmlDocStr = xmlDocStr.substr( xmlDocStr.indexOf("?>") + 2 );
			}
			xmlDoc=new ActiveXObject("Microsoft.XMLDOM");
			xmlDoc.async="false";
			xmlDoc.loadXML(xmlDocStr);
		}
		return xmlDoc;
	};
	
	this.asArray = function(prop) {
		if(prop instanceof Array)
			return prop;
		else
			return [prop];
	};
	
	this.toXmlDateTime = function(dt) {
		if(dt instanceof Date)
			return dt.toISOString();
		else
		if(typeof(dt) === 'number' )
			return new Date(dt).toISOString();
		else	
			return null;
	};
	
	this.asDateTime = function(prop) {
		if(typeof(prop) == "string") {
			return fromXmlDateTime(prop);
		}
		else
			return prop;
	};

	this.xml2json = function (xmlDoc) {
		return parseDOMChildren ( xmlDoc );
	};
	
	this.xml_str2json = function (xmlDocStr) {
		var xmlDoc = this.parseXmlString(xmlDocStr);
		if(xmlDoc!=null)
			return this.xml2json(xmlDoc);
		else
			return null;
	};

	this.json2xml_str = function (jsonObj) {
		return parseJSONObject ( jsonObj );
	};

	this.json2xml = function (jsonObj) {
		var xmlDocStr = this.json2xml_str (jsonObj);
		return this.parseXmlString(xmlDocStr);
	};
	
	this.getVersion = function () {
		return VERSION;
	};
	
}


function Endev(){
  this.app = angular.module("Endev")
}

endev = window.endev = new Endev();

}(window || this,_));

angular.element(document).ready(function() {
  angular.bootstrap(document, ['Endev']);
});
//# sourceMappingURL=endev.js.map