var OPERATORS_REGEX = new RegExp(/ AND | OR  /i);

module.exports = function(ngModule) {
    ngModule.directive("data", function($rootScope,$http,$injector,$interval,$timeout,$log,$interpolate,Expr) {
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
    });

};
