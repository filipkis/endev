//! makumba-angular.js
//! version: 0.1.0
//! authors: Filip Kis
//! license: MIT 

(function (window,document,undefined) {

	function Endev(){

		var OPERATORS_REGEX = new RegExp(/ AND | OR  /i);
		var COMPARISON_REGEX = new RegExp(/[=!><]+| (?:NOT )?LIKE | (?:NOT )?IN | IS (?:NOT )?NULL | (?:NOT )?MATCHES /);
		var PATH_REGEX = new RegExp(/^(?:[a-zA-Z_$][0-9a-zA-Z_$]*\.)*(?:[a-zA-Z_$][0-9a-zA-Z_$]*)/);

		function Expr(expr) {
			this.expression = expr;
			this.lhs = expr.split(COMPARISON_REGEX)[0].trim();
			this.rhs = expr.split(COMPARISON_REGEX)[1].trim();
			this.operator = COMPARISON_REGEX.exec(expr);
			this.replace = function(value) {
				return this.lhs + this.operator + value;
			}
		}

    this.app = angular.module("Endev", ["firebase"]);
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
							var provider = attrs.provider ? $injector.get(attrs.provider) :
								from.search(/http(s)?:\/\//) == 0 ? $injector.get("$endev-rest") : $injector.get('$yql');
							var label = attrs.from.split(" ")[1];
							var params = [];
							if (attrs.where) {
								params = attrs.where.split(OPERATORS_REGEX).map( function(expr) {
									return new Expr(expr);
								});
							}

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

							provider.query(scope,from,attrs.where,params,attrs).success(function(data) {
							  if (data.query) {
							    scope[label] = data.query.results;
							  } else {
							  	scope[label] = data;
							  }	
						      scope.$eval(attrs.success);
							  scope.$pending = false;
							  scope.$success = true;

							  if(attrs.log) {
								log.results = scope[label]
								$log.info(log);
							  }
						    }).
						    error(function(data, status, headers, config) {
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
						      // called asynchronously if an error occurs
						      // or server returns response with an error status.
						    });

						    if (count == 0) {
						    	params.forEach( function(param) {
									scope.$watch(params[param].rhs,execute);
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

		this.app.service("$yql", ['$http', function($http){ 
			return {
				query: function($scope,from,where,params,attrs) {
					var pWhere = where;
					for(var i = 0; i<params.length; i++) {
						var value = $scope.$eval(params[i].rhs);
						pWhere = pWhere.replace(params[i].expression, params[i].replace("'" + value + "'"));
					}
					var type = from.split(" ")[0];
					var label = from.split(" ")[1];
					var patt = new RegExp(label + ".", "g");
					if (pWhere) {
						var filteredWhere = pWhere.replace(patt,"");
					} else {
						var filteredWhere = "";
					}
					var query = "select * from " + type + " where " + filteredWhere;
					return $http.get("https://query.yahooapis.com/v1/public/yql?q=" + encodeURIComponent(query) + "&diagnostics=true&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys&format=json");
				}
			}
		}]);

		this.app.service("$endev-rest", ['$http','$interpolate', function($http,$interpolate){ 
			return {
				query: function($scope,from,where,params,attrs) {
					var pWhere = "";
					for(var i = 0; i<params.length; i++) {
						var value = $scope.$eval(params[i].rhs);
						pWhere += params[i].lhs + "=" + encodeURIComponent(value);
						if(i < params.length-1) {
							pWhere += "&";
						}
					}
					var type = from.split(" ")[0];
					var label = from.split(" ")[1]; 
					var patt = new RegExp(label + ".", "g");
					var filteredWhere = pWhere.replace(patt,"");
					var headers = $scope.$eval(attrs.headers)
					var config = {
						headers: headers,
						transformResponse: function(data, headersGetter) {
							if (headersGetter()['content-type']=="application/atom+xml") {
								var x2js = new X2JS();
								return x2js.xml_str2json(data);
							} else {
								return $scope.$eval(data);
							}
						}
					}
					var url = type
					if (url.indexOf('?') != -1) {
						url = url + "&" + filteredWhere;
					} else {
						url = url + "?" + filteredWhere;
					}
					return $http.get(url, config);
				}
			}
		}]);

		_.each([['if','ng-show'],['click','ng-click'],['value','ng-model']],function(pair){
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
              var path = rhs.match(PATH_REGEX)[0];
              if (rhs.charAt(path.length)==="(") {
                if (path.lastIndexOf(".") > 0) {
                  path = path.substring(0,path.lastIndexOf("."));
                } else {
                  path = null;
                }
              }
              if (path) {
                console.log(path)
                scope.$watch(path,function(newValue,oldValue){
                  eval();
                });
              }
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
              // scope.$watch(rhs,function(newValue,oldValue){
              //   $q.when(newValue).then(function(value){
              //     if(value && value["$bindTo"]) {
              //       value.$bindTo(scope,lhs);
              //     } else {
              //       scope[lhs] = value;
              //     }
              //   });
              // });
              eval();
            }
          }
        }
      }
    }]);

    this.app.service("PathMap",[function(){
      var map = [];
      return function(object,callback) {
        var result = _.find(map,function(elem){
          return _.isEqual(elem.key,this);
        },object);
        if(!result){
          result = {key:object,value:callback(object)};
          map.push(result)
        }
        return result.value;
      };
    }])


  	this.app.run(["$rootScope","$FirebaseArray","$FirebaseObject","$firebase","$q","PathMap",function($rootScope,$FirebaseArray,$FirebaseObject,$firebase,$q,PathMap) {
      $rootScope.Date = Date;
      $rootScope.Math = Math;
      $rootScope.$annotation = false;
      $rootScope.from = function(path) {
        return PathMap({from:path},function(args){
          var ref = new Firebase("https://endev.firebaseio.com");
          var sync = $firebase(ref.child(args.from),{
            arrayFactory: $FirebaseArray.$extendFactory({
              findOrNew: function(find,init) {
                return PathMap({object:this,find:find,init:init},function(args){
                  var deferred = $q.defer();
                  args.object.$list.$loaded().then(function(list){
                    var result = _.findWhere(list,args.find);
                    if(!result) {
                      result = _.extend(args.find,args.init);
                      result.$new = true;
                    }
                    deferred.resolve(result);
                  });
                  return result;
                });
              },
              findOrCreate: function(find,init) {
                return PathMap({object:this,find:find,init:init},function(args){
                  var deferred = $q.defer();
                  args.object.$list.$loaded().then(function(list){
                    var result = _.findWhere(list,args.find);
                    var objectRef;
                    if(!result) {
                      list.$add(_.extend(args.find,args.init)).then(function(ref){
                        objectRef = ref;
                      });
                    }else{
                      var ref = new Firebase(list.$inst().$ref().toString() + "/" + result.$id);
                    }
                    $firebase(ref).$asObject().$loaded().then(function(object){
                      _.extend(object,_.pick(args.init,function(value,key){
                        return !object[key] && angular.isArray(value) && value.length === 0;
                      }));
                      deferred.resolve(object);
                    });
                  });
                  return deferred.promise;
                });
              },
              insert: function(obj) {
                this.$list.$add(obj);
              },
              remove: function(obj) {
                this.$list.$remove(obj);
              }
            }),
            objectFactory: $FirebaseArray.$extendFactory({
              findOrNew: function(find,init) {
                var deferred = $q.defer();
                this.$loaded().then(function(list){
                  var result = _.findWhere(list,find);
                  if(!result) {
                    result = _.extend(find,init);
                    result.$new = true;
                  }
                  deferred.resolve(result);
                });
                return result;
              },
              findOrCreate: function(find,init) {
                var deferred = $q.defer();
                this.$list.$loaded().then(function(list){
                  var result = _.findWhere(list,find);
                  if(!result) {
                    list.$add(_.extend(find,init)).then(function(ref){
                      deferred.resolve($firebase(ref).$asObject());
                    });
                  }else{
                    deferred.resolve(result);
                  }
                });
                return deferred.promise;
              },
              insert: function(obj) {
                this.$list.$add(obj);
              },
              remove: function(obj) {
                this.$list.$remove(obj);
              }
            })
          });
          return sync.$asArray();
        });
      };

      Array.prototype.findOrNew = function(find,init){
        return PathMap({list:this,find:find,init:init},function(args){
          var result = _.findWhere(args.list,args.find);
          if(!result) {
            result = _.extend(args.find,args.init)
            result.$new = true;
          }
          return result;
        });
      }

      Array.prototype.findOrCreate = function(find,init){
        return PathMap({list:this,find:find,init:init},function(args){
          var result = _.findWhere(args.list,args.find);
          if(!result) {
            result = _.extend(args.find,args.init)
            this.push(result);
          }
          return result;
        });
      }

      Array.prototype.insert = function(obj) {
        obj['$new'] = undefined;
        obj['$deleted'] = undefined;
        obj['createdAt'] = new Date().getTime();
        this.push(obj);
      }

      Array.prototype.remove = function(obj) {
        this.splice(this.indexOf(obj),1);
        obj['$new'] = true;
        obj['$deleted'] = true;
      }

      if(this.document.getElementById('__endev_helper__')){
	      var style = this.document.createElement('style');
	      style.innerHTML = "  .__endev_annotated__ {" +
					"    outline: 1px solid rgba(255,0,0,0.5);" +
					"    border: 1px solid rgba(255,0,0,0.5);" +
					"    padding-top: 15px;" +
					"    margin-top:5px;" +
					"  }" +
					"  .__endev_annotation__ {" +
					"    display: none;" +
					"  }" +
					"  .__endev_annotated__ > .__endev_annotation__ {" +
					"    display: block;" +
					"    position: absolute;" +
					"    margin-top: -17px;" +
					"    font-size: 10px;" +
					"    font-family: monospace;" +
					"    background: rgba(255,255,125,0.5);" +
					"    color: #666;" +
					"    padding: 1px 3px;" +
					"    border: 1px dashed rgba(255,0,0,0.5);" +
					"    margin-left: 5px;" +
					"    cursor: pointer;" +
					"  }" +
					"  .__endev_annotated__ > .__endev_annotation__:hover {" +
					"    background: rgba(255,255,125,0.9);" +
					"  }" +
					"  .__endev_annotated__ > .__endev_list_item_annotated__ {" +
					"    outline: 1px dashed rgba(255,0,0,0.5);" +
					"  }" +
					"  table.__endev_annotated__, thead.__endev_annotated__, tbody.__endev_annotated__, tfoot.__endev_annotated__  {" +
					"    /*border: 1px solid red;*/" +
					"    padding-top: 10px;" +
					"    margin-top: 10px;" +
					"  }" +
					"  table .__endev_annotated__ > .__endev_annotation__ {" +
					"    margin-top: -1px;" +
					"  }";
				this.document.head.appendChild(style);
			}

    }]);
	}

	function EndevLog() {

	}

	function EndevQuery() {

	}
	
	endev = window.endev = new Endev();

}(window || this));

angular.element(document).ready(function() {
	angular.bootstrap(document, ['Endev']);
});