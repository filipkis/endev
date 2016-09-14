var $ = require('jquery');

var elements = null;
var $target;
var _this = this;

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


module.exports = this;