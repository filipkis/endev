//! makumba-angular.js
//! version: 0.1.0
//! authors: Filip Kis
//! license: MIT 

(function (window,document,undefined) {

	function Endev(){

		this.app = angular.module("Endev", []);


		// this.app.directive("import",['$rootScope',function($rootScope) {
		// 	return {
		// 		compile:function(tElement, tAttrs) {
		// 			angular.forEach(tAttrs.import.split(","), function(item){
		// 				item = item.trim();
		// 				$rootScope[item] = window[item];
		// 			});
		// 		}
		// 	}
		// }]);

		this.app.directive("data", ['$rootScope','$http','$injector','$interval','$timeout','$log','$interpolate', function($rootScope,$http,$injector,$interval,$timeout,$log,$interpolate) {
			return {
				restrict:'E',
				scope:true,
				link: function (scope,element,attrs) {
					var from = $interpolate(attrs.from,false,null,true)(scope)
					var provider = attrs.provider ? $injector.get(attrs.provider) :
						from.search(/http(s)?:\/\//) == 0 ? $injector.get("$endev-rest") : $injector.get('$yql');
					var label = attrs.from.split(" ")[1];
					var operators = new RegExp(/ AND | OR  /i);
					var comparison = new RegExp(/[=!><]+| (?:NOT )?LIKE | (?:NOT )?IN | IS (?:NOT )?NULL | (?:NOT )?MATCHES /);
					var params = [];
					var delay = attrs.delay ? scope.$eval(attrs.delay) : 0;
					if (attrs.where) {
						var exprs = attrs.where.split(operators);
						for (var i=0; i<exprs.length; i++) {
							var expr = {
								expression: exprs[i],
								lhs: exprs[i].split(comparison)[0].trim(),
								rhs: exprs[i].split(comparison)[1].trim(),
								operator: comparison.exec(exprs[i]),
								replace: function(value) {
									return this.lhs + this.operator + value;
								}
							}
							params.push(expr);
						} 
					}

					scope.$eval(attrs.pending); 
					scope.$pending = true;
					scope.$error = null;
					scope.$success = false;

					var execute = function() {
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

					};

					$timeout(execute,delay);

					if(attrs.refresh) {
						$interval(execute,attrs.refresh);
					}

					for(var i = 0; i<params.length; i++) {
						scope.$watch(params[i].rhs,function() {
							execute();
						})
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


		this.app.run(["$rootScope", function($rootScope) {
			$rootScope.Date = Date;
			$rootScope.Math = Math;
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