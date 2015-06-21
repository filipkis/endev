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
