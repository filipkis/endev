var endev = window.endev || {};
endev.app = require('./endev');
var utils = require('./utils');
var importTag = require('./attributes/import')

angular.element(document).ready(function() {

  if(endev.autoStart !== false) {
    importTag.ready(function(){
      angular.bootstrap(document, ['Endev']);
    })
  }
});


module.exports = endev;