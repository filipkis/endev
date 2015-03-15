//! makumba-angular.js
//! version: 0.1.0
//! authors: Filip Kis
//! license: MIT 

(function (window,_,document,undefined) {

	function Endev(){

		var OPERATORS_REGEX = new RegExp(/ AND | OR  /i);
		var COMPARISON_REGEX = new RegExp(/[=!><]+| (?:NOT )?LIKE | (?:NOT )?IN | IS (?:NOT )?NULL | (?:NOT )?MATCHES /);
		var PATH_REGEX = new RegExp(/^(?:[a-zA-Z_$][0-9a-zA-Z_$]*\.)*(?:[a-zA-Z_$][0-9a-zA-Z_$]*)/);
    var PAHT_ROOT_REGEX = new RegExp(/^[a-zA-Z_$][0-9a-zA-Z_$]*/);

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


    this.from = function(args) {
      if(_.isObject(args)){
        //multiple from
        var froms = attrs.from ? _.map(args.from.split(","), function(from){
          return {
            source: from.split(" ")[0],
            label: from.split(" ")[1]
          }
        }) : [];

        var params = attrs.where ? _.map(attrs.where.split(OPERATORS_REGEX), function(expr){
          return new Expr(expr);
        }) : [];


      }
    }


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

    //checking if angularFire is loaded
    try{ 
      angular.module("firebase")
      this.app = angular.module("Endev", ["endev-templates","firebase"]);  
    } catch(err) {
      this.app = angular.module("Endev",["endev-templates"]);
    }
    
    var $injector = angular.injector(["ng","Endev"]);


		this.app.directive("import",['$rootScope',function($rootScope) {
			return {
				compile:function(tElement, tAttrs) {
					angular.forEach(tAttrs.import.split(","), function(item){
						item = item.trim();
						$rootScope[item] = window[item];
					});
				}
			}
		}]);

		

		this.app.directive("data", ['$rootScope','$http','$injector','$interval','$timeout','$log','$interpolate', function($rootScope,$http,$injector,$interval,$timeout,$log,$interpolate) {
			return {
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
							// 	if (newValue != oldValue && !newValue) {
							// 		execute();
							// 	}
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



		this.app.service("$endevYql", ['$http','$q', function($http,$q){ 
			return {
				query: function(attrs) {
					var where = "";
					for(var i = 0; i<attrs.params.length; i++) {
						where = attrs.where.replace(attrs.params[i].expression, attrs.params[i].replace("'" + attrs.params[i].value + "'"));
					}
					
					var query = "select * from " + attrs.from + " where " + where;
          var result = $q.defer()
          $http.get("https://query.yahooapis.com/v1/public/yql?q=" 
            + encodeURIComponent(query) 
            + "&diagnostics=true&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys&format=json")
            .success(function(data){
              result.resolve(data.query.results);
            }).error(function(data){
              result.reject(data);
            });
					return result.promise
				}
			}
		}]);

    function prependTransform(defaults, transform) {
      // We can't guarantee that the transform transformation is an array
      transform = angular.isArray(transform) ? transform : [transform];
      // Append the new transformation to the defaults
      return transform.concat(defaults);
    }

		this.app.service("$endevRest", ['$http','$interpolate','$q', function($http,$interpolate,$q){ 
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

		_.each([['if','ng-show'],['click','ng-click']],function(pair){
      this.app.directive(pair[0],['$compile',function($compile){
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

    this.app.directive("value",['$compile',function($compile){
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

    this.app.directive("else",['$compile',function($compile){
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

    this.app.directive("list",['$compile',function($compile){
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

    this.app.directive("object",["$q",function($q){
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

    this.app.directive("endevAnnotation",[function(){      
      return {
        scope: {
          // annotation: "=endevAnnotation",
          // data: "=endevAnnotationData"
        },
        template: "<span class='__endev_annotation__' ng-if='$annotation'>{{annotation}}</span>" +
                  "<div>{{formatedData}}</div>",
        link: function (scope,element,attrs) {
          scope.$watch("data",function(value){
            scope["formatedData"] = angular.toJson(value,true);
          })
        }
      }
    }]);

    this.app.directive("fromE",['$interpolate','$endevProvider','$compile','$q', function($interpolate,$endevProvider,$compile,$q){
      function getRoot(element) {
        if(element[0].tagName === 'OPTION') {
          return element.parent();
        }
        return element;
      }

      return {
        // terminal: true,
        priority: 10000,
        restrict: 'A',
        scope: true,
        compile: function(tElement,tAttributes) {
          if(tElement[0].tagName !== 'DATA') {
            var attrFrom = tAttributes.fromE;
            var label = tAttributes.fromE.split(" ")[1];
            var annotation = "FROM " + tAttributes.fromE;
            if (tAttributes.where) annotation += " WHERE " + tAttributes.where
            // tElement.parent().prepend("<span class='__endev_annotation__' ng-if='$annotation'>" + annotation + "</span>");
            // tElement.parent().prepend("<span endev-annotation='" + annotation + "' endev-annotation-data='endevData_" + label + "'></span>");
            // tAttributes.$set("ng-class","{'__endev_list_item_annotated__':$annotation}")
            tAttributes.$set("ng-repeat",label + " in $endevData_" + label );
            tElement.removeAttr("data-from-e");
            var container
            getRoot(tElement).wrap("<span class='__endev_annotated__'></span>").parent().prepend("<span class='__endev_annotation__'>" + annotation + "</span>");
            // tElement.parent().prepend("<span></span>")
          }
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
                  attrs.$observe('fromE',function(value){
                    from = value;
                    console.log("From changed for",value);
                    execute();
                  })
                }

                var callback = function(data) {
                  // if(!_.isEqual(scope["_data_"],data))

                  if(!(_.keys(data).length >3) && attrs.default){
                    var def = scope.$eval(attrs.default);
                    data['default'] = scope.$eval(attrs.default);
                    scope['$isDefault'] = true;
                  } else {
                    scope['$isDefault'] = false;
                  }
                  scope["$endevData_" + label] = data;
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
                      .catch(function(data){
                        console.log("Query error: ",data);
                      });
                  }
                },100);//,angular.toJson);
                
              }
            }
          }
        }
      }
    }]);

    this.app.directive("insertInto", ['$interpolate','$endevProvider', function($interpolate,$endevProvider) {
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

    this.app.directive("removeFrom", ['$interpolate','$endevProvider', function($interpolate,$endevProvider) {
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
              
    this.app.service("$endevProvider",['$injector', function($injector){
      return {
        get: function(provider,type){
          return provider ? $injector.get('$endev' + provider[0].toUpperCase() + provider.slice(1)) :
            type.search(/http(s)?:\/\//) == 0 ? $injector.get("$endevRest") : $injector.get('$endevYql');
        }
      }
    }]);


    //The basic run
    this.app.run(["$rootScope","$document","$templateCache",function($rootScope,$document,$templateCache){
      $rootScope.Date = Date;
      $rootScope.Math = Math;
      $rootScope.$endevAnnotation = false;
      // $rootScope.$watch("$endevAnnotation",function(value){
      //   if(value){
      //     angular.element($document[0].body).addClass("__endev_annotated__");
      //   }else{
      //     angular.element($document[0].body).removeClass("__endev_annotated__");
      //   }
      // })
      angular.element($document[0].body).attr("ng-class","{'__endev_annotation_on__':$endevAnnotation}");
      angular.element($document[0].body).append($templateCache.get('endevHelper.tpl.html'));
    }]);

    //Firebase dependent features
    if ($injector.has('$firebaseObject')) {
      
      this.app.service("$endevFirebase",['$q','$firebaseObject','$firebaseArray', function($q,$firebaseObject,$firebaseArray){
        var ref = new Firebase("https://endev.firebaseio.com");
        
        function getObjectRef(type,parentLabel,parentObject,parentData){
          if(parentLabel){
            path = _.findKey(parentData,function(value){return value == parentObject}) 
              + "/" + type.substring(parentLabel.length + 1);
            console.log("Path with parent:",path);
            return objectRef(parentData.$ref,path);
          } else {
            return objectRef(ref,type);
          }
        }

        var objectRef = function(ref,path){
          return ref.child(path.replace(".","/"));
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
          var results = {$endevProviderType:"firebase",$ref:data.$ref()};
          _.each(data,function(value, key){
            if(!key.indexOf("$")!==0 && _.isMatchDeep(value,filter)){
              results[key] = value;
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
            $firebaseObject(objRef).$loaded().then(function(data){

              console.log("Data:",data)
              var object = filterData(data,attrs.filter);
              object.$endevRef = objRef;
              console.log("Object:",object)
              result.resolve(object);
              if(callback && angular.isFunction(callback)) callback(object);
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
              var key = _.findKey(object,function(value){return _.isMatchDeep(value,attrs.newObject)})
              $firebaseObject(object.$ref().child(key)).$remove();
            })

          }
        }
      }]);
      
      this.app.run(["$rootScope","$firebaseArray","$firebaseObject","$q",function($rootScope,$firebaseArray,$firebaseObject,$q) {
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

        if(this.document.getElementById('__endev_helper__')){
  	      var style = this.document.createElement('style');
  	      style.innerHTML = 

  				this.document.head.appendChild(style);
  			}

      }]);
    }
	}

	function EndevLog() {

	}

	function EndevQuery() {

	}
	
	endev = window.endev = new Endev();

}(window || this,_));

angular.element(document).ready(function() {
	angular.bootstrap(document, ['Endev']);
});