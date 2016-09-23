var $ = require('jquery');
var angular = require('angular');
var _ = require('underscore');

var elements = null;
var $target;
var _this = this;

var REMOVE_SELECTOR = '.__endev__ *, .__endev__, style, script';
var CONTENT_SELECTOR = '*:not(' +REMOVE_SELECTOR+ ')';

$(document).scroll(function(){
  if($target){
    _this.select($target);
  }
});

this.select = function(target){
  $target = $(target);
  targetOffset = $target[0].getBoundingClientRect(),
    targetHeight = targetOffset.height,
    targetWidth  = targetOffset.width;

  if(elements == null) {
    elements = {
      annotation: $('#__endev_selector_details__'),
      top: $('#__endev_selector_top__'),
      left: $('#__endev_selector_left__'),
      right: $('#__endev_selector_right__'),
      bottom: $('#__endev_selector_bottom__')
    }
  }
  
  elements.annotation.css({
    top:   (targetOffset.top - 2),
    left:  (targetOffset.left - 1),
  })
  
  elements.top.css({
    left:  (targetOffset.left - 1),
    top:   (targetOffset.top - 2),
    width: (targetWidth + 2)
  });
  elements.bottom.css({
    top:   (targetOffset.top + targetHeight + 1),
    left:  (targetOffset.left  - 1),
    width: (targetWidth + 2)  
  });
  elements.left.css({
    left:   (targetOffset.left  - 2),
    top:    (targetOffset.top  - 2),
    height: (targetHeight + 4)
  });
  elements.right.css({
    left:   (targetOffset.left + targetWidth + 1),
    top:    (targetOffset.top  - 2),
    height: (targetHeight + 4)
  });
};
angular.module('Endev').directive("endevHtmlInner",[function(){
  return function (scope, element, attrs) {
    element.on('click',function(event){
      if(scope.$root.$endevSelector){
        //var contents = JSON.parse(attrs.endevHtmlInner.replace("__{__{__","{{"));
        scope.$root.$broadcast('_endevShowPopup_',element);
        scope.$apply();
        event.stopPropagation();
        event.preventDefault();
      }
    })
  }
}]);
angular.module('Endev').controller('EndevPopup',['$scope','$compile', '$rootScope',function($scope,$compile){
  var original;
  var element;
  $scope.$on('_endevShowPopup_',function(event, parent, expressions){
    element = parent;
    $scope.elementOpts = {};
    $scope.expressions = undefined;
    var elScope = angular.element(element).scope();
    $scope.objects = _.map(_.filter(Object.getOwnPropertyNames(elScope),function(item){
      return item.indexOf('$') !== 0 && item.trim().length !== 0;
    }),function(item){
      return {name:item, value:elScope[item]};
    });
    $scope.isInput = $(element).is('input, select, textarea');
    original = getOriginal($(element).attr('endev-html-inner'));
    if($scope.isInput) {
      $scope.elementOpts.value = $(element).attr('data-value');
    }else {
      var expressions = $(original).contents().map(function(index, item){
        if (item.nodeType == 3) return item.nodeValue;
        return "__element__";
      },[]).toArray();
      $scope.expressions = _.map(expressions,function(item){
        return {expr:item.trim()}
      });
    }
    $scope.show = true;
  });
  $scope.isValid = function(expr){
    return expr.expr != '__element__' && !!expr.expr.match(/\S+/);
  }
  $scope.apply = function(){
    if($scope.isInput){
      $(original).attr('data-value',$scope.elementOpts.value);
    }else {
      $(original).contents().each(function(index,item){
        if(item.nodeType === 3){
          item.nodeValue = $scope.expressions[index].expr;
        }
      })
      //annotateWithExpressions(original);
    }
    updateCodePen();
    elScope = angular.element(element).scope();
    $('body').children().remove(CONTENT_SELECTOR);
    $('body').prepend(bodyClone.clone().children());
    $('body').find(CONTENT_SELECTOR).each(function(index, element){
      $(element).attr('endev-html-inner',index);
    });
    $compile($('body').children(CONTENT_SELECTOR))(elScope.$root);
    //var newEl = $(original).clone();
    //$(newEl).attr('endev-html-inner',$(element).attr('endev-html-inner'));
    //element.replaceWith($compile(newEl)(elScope));
    
    $scope.show = false;
  }
  $scope.close = function(){
    $scope.show = false;
  }
  $scope.prevent = function(event){
    event.stopPropagation();
  }
}]);

var updateCodePen = function(){
  if(window.location.hostname == 's.codepen.io'){
    var html = bodyClone.clone().find(REMOVE_SELECTOR).remove().end();
    window.parent.postMessage({messageName:'endevCodeUpdate', html:bodyClone.html()},'*');
  }
}

var annotateWithExpressions = function(element){
  var text = JSON.stringify($(element).contents().map(function(index, item){
    if (item.nodeType == 3) return item.nodeValue;
    return "__element__";
  },[]).toArray());
  $(element).attr('endev-html-inner',text.replace("{{",'__{__{__'));
}

var bodyClone;

var getOriginal = function(id){
  return bodyClone.find(CONTENT_SELECTOR)[id];
};

angular.module('Endev').run([function(){
  bodyClone = $('body').clone();
  //console.log(bodyClone.find('*:not(.__endev__ *, .__endev__)'));
  $('body').find(CONTENT_SELECTOR).each(function(index, element){
    $(element).attr('endev-html-inner',index);
  });
}]);


module.exports = this;