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

		this.app.directive("data", ['$rootScope','$http','$injector', function($rootScope,$http,$injector) {
			return {
				restrict:'E',
				scope:true,
				link: function (scope,element,attrs) {
					var provider = attrs.provider ? $injector.get(attrs.from.split(" ")[0].split(".")[0]) : $injector.get('$yql');
					var label = attrs.from.split(" ")[1];
					var operators = new RegExp(/ AND | OR  /i);
					var comparison = new RegExp(/[=!><]+| (?:NOT )?LIKE | (?:NOT )?IN | IS (?:NOT )?NULL | (?:NOT )?MATCHES /);
					var exprs = attrs.where.split(operators);
					var params = []
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

					var execute = function() {
						scope.$eval(attrs.pending); 
						scope.$pending = true;
						scope.$error = null;
						scope.$success = false;

						var pWhere = attrs.where;

						for(var i = 0; i<params.length; i++) {
							var value = scope.$eval(params[i].rhs);
							pWhere = pWhere.replace(params[i].expression, params[i].replace("'" + value + "'"));
						}

						provider.query(attrs.from,pWhere).success(function(data) {
					      scope[label] = data.query.results;
					      scope.$eval(attrs.success);
						  scope.$pending = false;
						  scope.$success = true;
					    }).
					    error(function(data, status, headers, config) {
					      scope.$eval(attrs.error);
						  scope.$pending = false;
						  scope.$success = false;
						  scope.$error = data.description;
					      // called asynchronously if an error occurs
					      // or server returns response with an error status.
					    });

					};

					execute();


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
				query: function(from,where) {
					var type = from.split(" ")[0];
					var lable = from.split(" ")[1];
					var label = from.split(" ")[1];
					var patt = new RegExp(label + ".", "g");
					var filteredWhere = where.replace(patt,"");
					var query = "select * from " + type + " where " + filteredWhere;
					return $http.get("https://query.yahooapis.com/v1/public/yql?q=" + encodeURIComponent(query) + "&diagnostics=true&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys&format=json");
				}
			}
		}]);

		this.app.run();
	}
	
	endev = window.endev = new Endev();

}(window || this));

angular.element(document).ready(function() {
	angular.bootstrap(document, ['Endev']);
});