/*! endev 0.2.0 2015-03-03 */
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
