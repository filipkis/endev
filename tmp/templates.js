angular.module('endev-templates', ['endevHelper.tpl.html']);

angular.module("endevHelper.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("endevHelper.tpl.html",
    "<style>\n" +
    "  #__endev_helper__ {  \n" +
    "    position: fixed;  \n" +
    "    bottom: 0;  \n" +
    "    left: 0;  \n" +
    "    right: 0;  \n" +
    "    background: #E0E0E0;  \n" +
    "    border-top: 1px solid #929292;  \n" +
    "    padding: 5px;  \n" +
    "    font-family: sans-serif;  \n" +
    "    font-size: 12px;  \n" +
    "  }  \n" +
    "\n" +
    "  .__endev_annotation_on__ .__endev_annotated__ { \n" +
    "    outline: 1px solid rgba(255,0,0,0.5); \n" +
    "    /*border: 1px solid rgba(255,0,0,0.5); */\n" +
    "    padding-top: 15px; \n" +
    "    margin-top:5px;\n" +
    "    display:block; \n" +
    "  } \n" +
    "  .__endev_annotation__ { \n" +
    "    display: none; \n" +
    "  }\n" +
    "  .__endev_annotation_on__ .__endev_annotated__ > .__endev_annotation__ { \n" +
    "    display: block; \n" +
    "    position: absolute; \n" +
    "    margin-top: -22px; \n" +
    "    font-size: 10px; \n" +
    "    font-family: monospace; \n" +
    "    background: #FFFFD1; \n" +
    "    color: #666; \n" +
    "    padding: 1px 3px; \n" +
    "    border: 1px dashed rgba(255,0,0,0.5); \n" +
    "    margin-left: 5px; \n" +
    "    cursor: pointer; \n" +
    "  } \n" +
    "  .__endev_annotated__ > .__endev_annotation__:hover { \n" +
    "    background: rgba(255,255,125,0.9); \n" +
    "  } \n" +
    "  .__endev_annotated__ > .__endev_list_item_annotated__ { \n" +
    "    outline: 1px dashed rgba(255,0,0,0.5); \n" +
    "  } \n" +
    "  table.__endev_annotated__, thead.__endev_annotated__, tbody.__endev_annotated__, tfoot.__endev_annotated__  { \n" +
    "    /*border: 1px solid red;*/\n" +
    "    padding-top: 10px; \n" +
    "    margin-top: 10px; \n" +
    "  } \n" +
    "  table .__endev_annotated__ > .__endev_annotation__ { \n" +
    "    margin-top: -1px; \n" +
    "  }\n" +
    "</style>\n" +
    "<div id=\"__endev_helper__\">\n" +
    "  Endev Tools:\n" +
    "  <button ng-click=\"$endevAnnotation = !$endevAnnotation\">Annotations {{$endevAnnotation ? 'off' : 'on'}}</button>\n" +
    "</div>");
}]);
