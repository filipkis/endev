(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.endev = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function(a,b){if(typeof define==="function"&&define.amd){define([],b);}else{if(typeof exports==="object"){module.exports=b();}else{a.X2JS=b();}}}(this,function(){return function(z){var t="1.2.0";z=z||{};i();u();function i(){if(z.escapeMode===undefined){z.escapeMode=true;}z.attributePrefix=z.attributePrefix||"_";z.arrayAccessForm=z.arrayAccessForm||"none";z.emptyNodeForm=z.emptyNodeForm||"text";if(z.enableToStringFunc===undefined){z.enableToStringFunc=true;}z.arrayAccessFormPaths=z.arrayAccessFormPaths||[];if(z.skipEmptyTextNodesForObj===undefined){z.skipEmptyTextNodesForObj=true;}if(z.stripWhitespaces===undefined){z.stripWhitespaces=true;}z.datetimeAccessFormPaths=z.datetimeAccessFormPaths||[];if(z.useDoubleQuotes===undefined){z.useDoubleQuotes=false;}z.xmlElementsFilter=z.xmlElementsFilter||[];z.jsonPropertiesFilter=z.jsonPropertiesFilter||[];if(z.keepCData===undefined){z.keepCData=false;}}var h={ELEMENT_NODE:1,TEXT_NODE:3,CDATA_SECTION_NODE:4,COMMENT_NODE:8,DOCUMENT_NODE:9};function u(){}function x(B){var C=B.localName;if(C==null){C=B.baseName;}if(C==null||C==""){C=B.nodeName;}return C;}function r(B){return B.prefix;}function s(B){if(typeof(B)=="string"){return B.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&apos;");}else{return B;}}function k(B){return B.replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&quot;/g,'"').replace(/&apos;/g,"'").replace(/&amp;/g,"&");}function w(C,F,D,E){var B=0;for(;B<C.length;B++){var G=C[B];if(typeof G==="string"){if(G==E){break;}}else{if(G instanceof RegExp){if(G.test(E)){break;}}else{if(typeof G==="function"){if(G(F,D,E)){break;}}}}}return B!=C.length;}function n(D,B,C){switch(z.arrayAccessForm){case"property":if(!(D[B] instanceof Array)){D[B+"_asArray"]=[D[B]];}else{D[B+"_asArray"]=D[B];}break;}if(!(D[B] instanceof Array)&&z.arrayAccessFormPaths.length>0){if(w(z.arrayAccessFormPaths,D,B,C)){D[B]=[D[B]];}}}function a(G){var E=G.split(/[-T:+Z]/g);var F=new Date(E[0],E[1]-1,E[2]);var D=E[5].split(".");F.setHours(E[3],E[4],D[0]);if(D.length>1){F.setMilliseconds(D[1]);}if(E[6]&&E[7]){var C=E[6]*60+Number(E[7]);var B=/\d\d-\d\d:\d\d$/.test(G)?"-":"+";C=0+(B=="-"?-1*C:C);F.setMinutes(F.getMinutes()-C-F.getTimezoneOffset());}else{if(G.indexOf("Z",G.length-1)!==-1){F=new Date(Date.UTC(F.getFullYear(),F.getMonth(),F.getDate(),F.getHours(),F.getMinutes(),F.getSeconds(),F.getMilliseconds()));}}return F;}function q(D,B,C){if(z.datetimeAccessFormPaths.length>0){var E=C.split(".#")[0];if(w(z.datetimeAccessFormPaths,D,B,E)){return a(D);}else{return D;}}else{return D;}}function b(E,C,B,D){if(C==h.ELEMENT_NODE&&z.xmlElementsFilter.length>0){return w(z.xmlElementsFilter,E,B,D);}else{return true;}}function A(D,J){if(D.nodeType==h.DOCUMENT_NODE){var K=new Object;var B=D.childNodes;for(var L=0;L<B.length;L++){var C=B.item(L);if(C.nodeType==h.ELEMENT_NODE){var I=x(C);K[I]=A(C,I);}}return K;}else{if(D.nodeType==h.ELEMENT_NODE){var K=new Object;K.__cnt=0;var B=D.childNodes;for(var L=0;L<B.length;L++){var C=B.item(L);var I=x(C);if(C.nodeType!=h.COMMENT_NODE){var H=J+"."+I;if(b(K,C.nodeType,I,H)){K.__cnt++;if(K[I]==null){K[I]=A(C,H);n(K,I,H);}else{if(K[I]!=null){if(!(K[I] instanceof Array)){K[I]=[K[I]];n(K,I,H);}}(K[I])[K[I].length]=A(C,H);}}}}for(var E=0;E<D.attributes.length;E++){var F=D.attributes.item(E);K.__cnt++;K[z.attributePrefix+F.name]=F.value;}var G=r(D);if(G!=null&&G!=""){K.__cnt++;K.__prefix=G;}if(K["#text"]!=null){K.__text=K["#text"];if(K.__text instanceof Array){K.__text=K.__text.join("\n");}if(z.stripWhitespaces){K.__text=K.__text.trim();}delete K["#text"];if(z.arrayAccessForm=="property"){delete K["#text_asArray"];}K.__text=q(K.__text,I,J+"."+I);}if(K["#cdata-section"]!=null){K.__cdata=K["#cdata-section"];delete K["#cdata-section"];if(z.arrayAccessForm=="property"){delete K["#cdata-section_asArray"];}}if(K.__cnt==0&&z.emptyNodeForm=="text"){K="";}else{if(K.__cnt==1&&K.__text!=null){K=K.__text;}else{if(K.__cnt==1&&K.__cdata!=null&&!z.keepCData){K=K.__cdata;}else{if(K.__cnt>1&&K.__text!=null&&z.skipEmptyTextNodesForObj){if((z.stripWhitespaces&&K.__text=="")||(K.__text.trim()=="")){delete K.__text;}}}}}delete K.__cnt;if(z.enableToStringFunc&&(K.__text!=null||K.__cdata!=null)){K.toString=function(){return(this.__text!=null?this.__text:"")+(this.__cdata!=null?this.__cdata:"");};}return K;}else{if(D.nodeType==h.TEXT_NODE||D.nodeType==h.CDATA_SECTION_NODE){return D.nodeValue;}}}}function o(I,F,H,C){var E="<"+((I!=null&&I.__prefix!=null)?(I.__prefix+":"):"")+F;if(H!=null){for(var G=0;G<H.length;G++){var D=H[G];var B=I[D];if(z.escapeMode){B=s(B);}E+=" "+D.substr(z.attributePrefix.length)+"=";if(z.useDoubleQuotes){E+='"'+B+'"';}else{E+="'"+B+"'";}}}if(!C){E+=">";}else{E+="/>";}return E;}function j(C,B){return"</"+(C.__prefix!=null?(C.__prefix+":"):"")+B+">";}function v(C,B){return C.indexOf(B,C.length-B.length)!==-1;}function y(C,B){if((z.arrayAccessForm=="property"&&v(B.toString(),("_asArray")))||B.toString().indexOf(z.attributePrefix)==0||B.toString().indexOf("__")==0||(C[B] instanceof Function)){return true;}else{return false;}}function m(D){var C=0;if(D instanceof Object){for(var B in D){if(y(D,B)){continue;}C++;}}return C;}function l(D,B,C){return z.jsonPropertiesFilter.length==0||C==""||w(z.jsonPropertiesFilter,D,B,C);}function c(D){var C=[];if(D instanceof Object){for(var B in D){if(B.toString().indexOf("__")==-1&&B.toString().indexOf(z.attributePrefix)==0){C.push(B);}}}return C;}function g(C){var B="";if(C.__cdata!=null){B+="<![CDATA["+C.__cdata+"]]>";}if(C.__text!=null){if(z.escapeMode){B+=s(C.__text);}else{B+=C.__text;}}return B;}function d(C){var B="";if(C instanceof Object){B+=g(C);}else{if(C!=null){if(z.escapeMode){B+=s(C);}else{B+=C;}}}return B;}function p(C,B){if(C===""){return B;}else{return C+"."+B;}}function f(D,G,F,E){var B="";if(D.length==0){B+=o(D,G,F,true);}else{for(var C=0;C<D.length;C++){B+=o(D[C],G,c(D[C]),false);B+=e(D[C],p(E,G));B+=j(D[C],G);}}return B;}function e(I,H){var B="";var F=m(I);if(F>0){for(var E in I){if(y(I,E)||(H!=""&&!l(I,E,p(H,E)))){continue;}var D=I[E];var G=c(D);if(D==null||D==undefined){B+=o(D,E,G,true);}else{if(D instanceof Object){if(D instanceof Array){B+=f(D,E,G,H);}else{if(D instanceof Date){B+=o(D,E,G,false);B+=D.toISOString();B+=j(D,E);}else{var C=m(D);if(C>0||D.__text!=null||D.__cdata!=null){B+=o(D,E,G,false);B+=e(D,p(H,E));B+=j(D,E);}else{B+=o(D,E,G,true);}}}}else{B+=o(D,E,G,false);B+=d(D);B+=j(D,E);}}}}B+=d(I);return B;}this.parseXmlString=function(D){var F=window.ActiveXObject||"ActiveXObject" in window;if(D===undefined){return null;}var E;if(window.DOMParser){var G=new window.DOMParser();var B=null;if(!F){try{B=G.parseFromString("INVALID","text/xml").getElementsByTagName("parsererror")[0].namespaceURI;}catch(C){B=null;}}try{E=G.parseFromString(D,"text/xml");if(B!=null&&E.getElementsByTagNameNS(B,"parsererror").length>0){E=null;}}catch(C){E=null;}}else{if(D.indexOf("<?")==0){D=D.substr(D.indexOf("?>")+2);}E=new ActiveXObject("Microsoft.XMLDOM");E.async="false";E.loadXML(D);}return E;};this.asArray=function(B){if(B===undefined||B==null){return[];}else{if(B instanceof Array){return B;}else{return[B];}}};this.toXmlDateTime=function(B){if(B instanceof Date){return B.toISOString();}else{if(typeof(B)==="number"){return new Date(B).toISOString();}else{return null;}}};this.asDateTime=function(B){if(typeof(B)=="string"){return a(B);}else{return B;}};this.xml2json=function(B){return A(B);};this.xml_str2json=function(B){var C=this.parseXmlString(B);if(C!=null){return this.xml2json(C);}else{return null;}};this.json2xml_str=function(B){return e(B,"");};this.json2xml=function(C){var B=this.json2xml_str(C);return this.parseXmlString(B);};this.getVersion=function(){return t;};};}));
},{}],2:[function(require,module,exports){
(function (global){
var angular = (typeof window !== "undefined" ? window['angular'] : typeof global !== "undefined" ? global['angular'] : null);
var utils = require('./../utils.js');

// For backwards compatibility we support two different names
angular.forEach(['deleteFrom','removeFrom'], function(name){
  angular.module('Endev').directive(name, ['$interpolate','$endevProvider', function($interpolate,$endevProvider) {
    return {
      scope:true,
      link: function (scope,element,attrs) {
        var from = $interpolate(attrs['name'],false,null,true)(scope)
        var context = $endevProvider.getContext(attrs.provider,deleteFrom,element,scope);
        var provider = context.provider;
        var parent = context.parent;

        scope.remove = function(object) {
          utils.removeFn(from,object,parent,scope,provider)
        }
      }
    }
  }]);
});


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./../utils.js":26}],3:[function(require,module,exports){
(function (global){
var angular = (typeof window !== "undefined" ? window['angular'] : typeof global !== "undefined" ? global['angular'] : null);

angular.module('Endev').directive("describe",['$endevProvider',function($endevProvider){
  return {
    priority: 1001,
    terminal: true,
    link: function(scope,element,attrs) {
      var yql = $endevProvider.getContext("yql").provider;
      if(!_.isUndefined(attrs.describe)) {
        yql.desc(attrs.describe).then(function(desc){
          var res = {
            parameters: _.map(desc.request.select.key,function(value){return _.pick(value,"name","type","required")})
          }
          var text = desc.name
          if(desc.meta.documentationURL) {
            text = text + " <a href='" + desc.meta.documentationURL + "'>documentation</a>"
          }
          element[0].innerHTML = text + "<pre class='_endev_json_'>" + utils.syntaxHighlight(JSON.stringify(res, undefined, 2)) + "</pre>";
        });
      }
    }
  }
}])
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],4:[function(require,module,exports){
(function (global){
var angular = (typeof window !== "undefined" ? window['angular'] : typeof global !== "undefined" ? global['angular'] : null);

angular.module('Endev').directive("drag",['$compile',function($compile){
  return {
    link: function (scope,element,attrs) {
      element.bind("dragstart", function(ev){
        ev.dataTransfer.setData("text/plain", JSON.stringify(scope.$eval(attrs.drag)));
        ev.dataTransfer.effectAllowed = "move";
      })
      // If can drag condition set
      if(attrs.canDrag) {
        scope.$watch(attrs.canDrag,function(newValue){
          if(newValue){ // and condition ture
            attrs.$set("draggable","true") // make it draggable
          } else {
            attrs.$set("draggable","false") // make it non-draggable
          }
        })
      } else { // make it draggable
        attrs.$set("draggable","true");
      }
    }
  }
}]);
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],5:[function(require,module,exports){
(function (global){
var angular = (typeof window !== "undefined" ? window['angular'] : typeof global !== "undefined" ? global['angular'] : null);

angular.module('Endev').directive("drop",['$compile',function($compile){
  return {
    link: function (scope,element,attrs) {
      element.bind("dragover",function(ev){
        ev.dataTransfer.effectAllowed = "move";
        ev.preventDefault();
        return false;
      })
      element.bind("drop", function(ev){
        ev.preventDefault();
        var data = JSON.parse(ev.dataTransfer.getData('text'));
        var canDrop = attrs.canDrop ? scope.$eval(attrs.canDrop,{source:data,target:scope}) : true;
        if(canDrop) {
          scope.$eval(attrs.drop,{source:data,target:scope});
          scope.$apply();
        }
      })
    }
  }
}]);
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],6:[function(require,module,exports){
(function (global){
var angular = (typeof window !== "undefined" ? window['angular'] : typeof global !== "undefined" ? global['angular'] : null);

angular.module('Endev').directive("edit",['$compile',function($compile){
  return {
    terminal: true,
    priority: 1000,
    compile: function(element, attrs) {
      element.attr("ng-if", "!$isDefault");
      element.removeAttr("data-edit");
      return {
        pre: function preLink(scope, iElement, iAttrs, controller) {  },
        post: function postLink(scope, iElement, iAttrs, controller) {
          $compile(iElement)(scope);
        }
      };
    }
  }
}]);
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],7:[function(require,module,exports){
(function (global){
var angular = (typeof window !== "undefined" ? window['angular'] : typeof global !== "undefined" ? global['angular'] : null);

angular.module('Endev').directive("else",['$compile',function($compile){
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
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],8:[function(require,module,exports){
(function (global){
var angular = (typeof window !== "undefined" ? window['angular'] : typeof global !== "undefined" ? global['angular'] : null);
var utils = require('./../utils');

angular.module('Endev').directive("explain",function(){
  return {
    link: function(scope,element,attrs) {
      scope.$watch(attrs.explain,function(newValue){
        if(!_.isUndefined(newValue)){
          element[0].innerHTML = "<pre class='_endev_json_'>" + utils.syntaxHighlight(JSON.stringify(newValue, undefined, 2)) + "</pre>";
        }
      });
    }
  }
})
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./../utils":26}],9:[function(require,module,exports){
(function (global){
var angular = (typeof window !== "undefined" ? window['angular'] : typeof global !== "undefined" ? global['angular'] : null);
var utils = require('./../utils');

var OPERATORS_REGEX = new RegExp(/ AND | OR  /i);

angular.module('Endev').directive("endevAnnotation",[function(){
  return {
    // scope: {
    //   // annotation: "=endevAnnotation",
    //   // data: "=endevAnnotationData"
    // },
    link: function (scope,element,attrs) {
      element.prepend("<span class='__endev_annotation__'>" + attrs.endevAnnotation + "</span>");
      scope.$on("$endevData_" + attrs.endevAnnotation,function(event,data){

        element.append(angular.toJson(data,true));
        event.stopPropagation();
      })
      // scope.$watch("data",function(value){
      //   scope["formatedData"] = angular.toJson(value,true);
      // })
    }
  }
}]);

angular.module('Endev').directive("endevItem",["$endevProvider","$interpolate",function($endevProvider,$interpolate){
  return {
    // require: "^from",
    link: function(scope,element,attrs){
      var attrFrom = attrs.endevItem;
      var label = attrs.endevItem.split(" ")[1];
      var from = $interpolate(attrFrom,false,null,true)(scope);
      var type = from.split(" ")[0];
      var context = $endevProvider.getContext(attrs.provider,attrFrom,element,scope);
      var provider = context.provider;
      var parent = context.parent;

      if(attrs.hasOwnProperty("autoUpdate") && (attrs.autoUpdate == "" || attrs.autoUpdate)){
        // scope.$watch(label,function(value){
        var value = scope[label];
        if(value && provider.bind && !value['default']){
          console.log("Item value changed",value);
          var queryParameters = {from:type,scope:scope,label:label};

          queryParameters.object = value;
          queryParameters.data = scope["$endevData_" + label];

          if(parent) {
            queryParameters.parentLabel = parent;
            queryParameters.parentObject = scope[parent];
            queryParameters.parentData = scope["$endevData_" + parent];
          }

          provider.bind(queryParameters);
        }
      }
      scope.$watch(label,function(value){
        if(value && attrs.loaded){
          scope.$eval(attrs.loaded);
        }
      });
    }
  }
}]);

angular.module('Endev').directive("from",['$interpolate','$endevProvider','$compile','$q','$rootScope','$timeout','Expr', function($interpolate,$endevProvider,$compile,$q,$rootScope,$timeout,Expr){
  function getRoot(element) {
    if(element[0].tagName === 'OPTION') {
      return element.parent();
    }
    return element;
  }

  function getParentLabel(scope,object){
    var pLabel = _.chain(scope)
      .allKeys()
      .filter(function(key){return key.indexOf("$endevData_")==0})
      .find(function(key){return _.find(scope[key], function(value){return angular.equals(object,value)})})
      .value();
    return pLabel.substring(pLabel.indexOf("_")+1);
  }

  return {
    // terminal: true,
    priority: 1000,
    restrict: 'A',
    scope: true,
    compile: function(tElement,tAttributes) {
      if(tElement[0].tagName !== 'DATA') {
        var attrFrom = tAttributes.from;
        var label = tAttributes.from.split(" ")[1];
        var annotation = "FROM " + tAttributes.from;
        if (tAttributes.where) annotation += " WHERE " + tAttributes.where
        // tElement.parent().prepend("<span class='__endev_annotation__' ng-if='$annotation'>" + annotation + "</span>");
        // tElement.parent().prepend("<span endev-annotation='" + annotation + "' endev-annotation-data='endevData_" + label + "'></span>");
        // tAttributes.$set("ng-class","{'__endev_list_item_annotated__':$annotation}")
        tAttributes.$set("ng-repeat",label + " in $endevData_" + label + " track by $endevId(" + label + ",$id)" );
        tAttributes.$set("endev-item",tAttributes.from)
        if(tElement.parent().length > 0 && ["TBODY"].indexOf(tElement.parent()[0].tagName)>=0) {
          tElement.parent().addClass("__endev_annotated__");
          tElement.parent().append("<span class='__endev_annotation__'>" + annotation + "</span>");
        }else {
          getRoot(tElement).wrap("<span class='__endev_annotated__'></span>").parent().prepend("<span class='__endev_annotation__'>" + annotation + "</span>");
        }
        // tElement.parent().prepend("<span></span>")

      }
      tElement.removeAttr("data-from");
      tElement.removeAttr("from");
      return {
        pre: function preLink(scope, iElement, iAttrs, controller) {  },
        post: function postLink(scope, element, attrs, controller,transform) {
          element  =  $compile(element)(scope);
          if(element[0].tagName !== 'DATA') {
            if(angular.isDefined(scope["$endevData_" + label]))
              throw new Error("Conflicting object " + label + " defined by:", element);
            var from = $interpolate(attrFrom,false,null,true)(scope);
            var type = from.split(",")[0].split(" ")[0];
            var params = attrs.where ? attrs.where.split(OPERATORS_REGEX).map( function(expr) {
              var exp = new Expr(expr,label);
              exp.setValue(scope.$eval(exp.rhs));
              return exp;
            }) : [];
            var context = $endevProvider.getContext(attrs.provider,from,element,scope);
            var provider = context.provider;
            var parent = context.parent;

            scope.$endevId = function(item,idFn) {
              if (item) {
                return item.$$endevId || item.$id || idFn(item);
              }
              return idFn(item);
            }

            if(provider.update) {
              scope.update = function(object,data) {
                var pLabel = getParentLabel(scope,object);
                var type = scope["$endevParentType_" + pLabel];
                var label = pLabel;
                var parent = scope["$endevParentParent_" + pLabel];
                var queryParameters = {from:type,scope:scope,label:label};

                if (parent) {
                  queryParameters.parentLabel = parent;
                  queryParameters.parentObject = scope[parent];
                  queryParameters.parentData = scope["$endevData_" + parent];
                }

                queryParameters.updatedObject = _.extend(object,data);
                provider.update(queryParameters);
              }
            }
            if(provider.remove) {
              scope.remove = scope['delete'] = function(object){
                var pLabel = getParentLabel(scope,object);
                utils.removeFn(scope["$endevParentType_" + pLabel],object,scope["$endevParentParent_" + pLabel],scope,scope["$endevProvider_" + pLabel]);
              }
            }
            scope["$endevParentParent_" + label] = parent;
            scope["$endevParentType_" + label] = type;
            scope["$endevProvider_" + label] = provider;
            var watchExp = _.map(params,function(item){return item.rhs});
            if(parent) watchExp.push(parent);
            if(watchExp.length>0) {
              scope.$watchGroup(watchExp,function(values){
                _.map(values.length > params.length ? values.slice(0,-1) : values ,function(value,index){
                  params[index].setValue(value)
                });
                console.log("Params changed for ",attrFrom,values);
                execute();
              });
            } else {
              attrs.$observe('from',function(value){
                from = value;
                console.log("From changed for",value);
                execute();
              })
            }

            var unbind;

            var callback = function(data) {
              $timeout(function(){
                // if(!_.isEqual(scope["_data_"],data))
                if(!angular.isArray(data)) data = [data];
                if(unbind) unbind();
                if((!data || !(data.length >0)) && attrs.default){
                  // if(!(_.keys(data).length >3) && attrs.default){
                  var def = scope.$eval(attrs.default);
                  if(angular.isFunction(data.$add) && attrs.autoInsert) {
                    //TODO consider using where data as well
                    data.$add(def);
                  } else {
                    data.push(def);
                  }
                  // data['default'] = def;
                  scope['$isDefault'] = true;
                } else {
                  scope['$isDefault'] = false;
                }
                if(angular.isArray(data) && attrs.limit){
                  data = data.slice(0,parseInt(attrs.limit));
                }
                scope["$endevData_" + label] = data;
                if(scope["$endevAnnotation"]){
                  scope.$emit("$endevData_" + label, data);
                }
              })
            };

            var executionId = 0;

            var execute = _.debounce(function (){
              console.log("Executed with params: ", params);
              if(provider){

                var equalityParams = _.filter(params,function(param){return param.operator[0] == "="});

                var filter = _.reduce(equalityParams,function(memo,param){return utils.merge(param.obj,memo)},{});
                // console.log("Filter: ", filter);
                var queryParameters = _.defaults({from:type,where:attrs.where,params:params,filter:filter},_.extendOwn({},_.pick(attrs,function(value,key){ return key.indexOf('$') !=0 })));

                if (parent) {
                  queryParameters.parentLabel = parent;
                  queryParameters.parentObject = scope[parent];
                  queryParameters.parentData = scope["$endevData_" + parent];
                }

                var id = ++executionId;

                var executionCallback = function(data){
                  if (id == executionId){
                    callback(data);
                  }
                }

                provider.query(queryParameters,null,executionCallback)
                  .then(function(data){
                    scope['$endevError'] = false;
                    executionCallback(data);
                  })
                  .catch(function(data){
                    scope['$endevError'] = true;
                    console.log("Query error: ",data);
                    scope['$endevErrors'].push(data);
                  });
              }
            },100);//,angular.toJson);

          }
        }
      }
    },
    controller: ["$scope", "$element", "$attrs", function($scope, $element, $attrs){
      $scope.count = function(object){
        return _.size(object);
      }
    }]
  }
}]);


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./../utils":26}],10:[function(require,module,exports){
(function (global){
var angular = (typeof window !== "undefined" ? window['angular'] : typeof global !== "undefined" ? global['angular'] : null);
var jquery = (typeof window !== "undefined" ? window['jquery'] : typeof global !== "undefined" ? global['jquery'] : null);

angular.module('Endev').directive("import",["$rootScope", "$http", "$compile", function($rootScope,$http,$compile) {
  return {
    compile:function(tElement, tAttrs) {
      angular.forEach(tAttrs.import.split(","), function(item){
        item = item.trim();
        if(item.indexOf('bower:') == 0) {
          item = item.split(":")[1].trim();
          $rootScope[item] = window[item];
        }else {
          $rootScope[item] = window[item];
        }
      });
    }
  }
}]);

var getGitRepo = function(url) {
  var match = url.match(/(?:https:\/\/github.com\/)([^\/]+\/[^\/]+)/)
  if(match.length > 1) {
    if(match[1].substr(-4) == '.git') {
      match[1] = match[1].substr(0,match[1].length - 4)
      return match[1];
    }
    return url.match(/(?:https:\/\/github.com\/)([^\/]+\/[^\/]+)/)[1];
  }
  return null
}

module.exports = {
  ready: function(cb){
    var importsObjects = document.querySelectorAll("[import]");
    var imports = [];

    // Callback function that will be called when
    var ready = function (libName) {
      if(imports.indexOf(libName) > -1){
        imports.splice(imports.indexOf(libName))
      }
      if (imports.length == 0) {
        cb();
      }
    };

    for (var i = 0; i < importsObjects.length; i++) {
      var values = importsObjects[i].getAttribute("import").split(",");
      for (var j = 0; j < values.length; j++) {
        if (values[j].indexOf('bower:') == 0) {
          var libName = values[j].split(":")[1].trim();
          imports.push(libName);
          jquery.get({
            url: 'https://bower.herokuapp.com/packages/search/' + libName,
            success: function (data) {
              if (angular.isArray(data) || data.length > 0) {
                var lib = data[0];
                console.log("Found lib to import:", lib.name)
                var repo = getGitRepo(lib.url);
                var baseUrl = "https://cdn.rawgit.com/" + repo + "/master/";
                jquery.get({
                  url: baseUrl + "package.json",
                  success: function (json) {
                    var main = json.main;
                    console.log('Found main', main);
                    var script = document.createElement('script');
                    script.setAttribute('type', 'text/javascript');
                    script.setAttribute('src', baseUrl + main);
                    script.onload = function () {
                      ready(libName);
                    }
                    script.onerror = function(){
                      ready(libName);
                    };
                    document.getElementsByTagName("head")[0].appendChild(script);
                  }
                });
              }
            },
            error: function (data) {
              ready(libName);
            }
          })
        }
      }
    }
    ready();
  }
}
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],11:[function(require,module,exports){
(function (global){
var angular = (typeof window !== "undefined" ? window['angular'] : typeof global !== "undefined" ? global['angular'] : null);

var cleanObject = function(object) {
  if(angular.isObject(object)) {
    for(var attr in object){
      if(object[attr] == undefined) {
        object[attr] = null;
      } else {
        cleanObject(object[attr]);
      }
    }
  }
}

angular.module('Endev').directive("insertInto", ['$interpolate','$endevProvider', function($interpolate,$endevProvider) {
  return {
    scope:true,
    link: function (scope,element,attrs) {
      var insertInto = $interpolate(attrs.insertInto,false,null,true)(scope)
      var context = $endevProvider.getContext(attrs.provider,insertInto,element,scope);
      var provider = context.provider;
      var parent = context.parent;

      scope.insert = function(object) {
        console.log("Inserting:",object);

        cleanObject(object);

        var queryParameters = {insertInto:insertInto,newObject:object};

        if (parent) {
          queryParameters.parentLabel = parent;
          queryParameters.parentObject = scope[parent];
          queryParameters.parentData = scope["$endevData_" + parent];
        }

        provider.insert(queryParameters).then(function(data){
          if(!_.isEqual(object,data)){
            object = data;
          }
        });
      }
    }
  }
}]);
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],12:[function(require,module,exports){
(function (global){
var angular = (typeof window !== "undefined" ? window['angular'] : typeof global !== "undefined" ? global['angular'] : null);

angular.module('Endev').directive("new",['$compile',function($compile){
  return {
    terminal: true,
    priority: 1000,
    compile: function(element, attrs) {
      element.attr("ng-if", "$isDefault");
      element.removeAttr("data-new");
      return {
        pre: function preLink(scope, iElement, iAttrs, controller) {  },
        post: function postLink(scope, iElement, iAttrs, controller) {
          $compile(iElement)(scope);
        }
      };
    }
  }
}]);
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],13:[function(require,module,exports){
(function (global){
var angular = (typeof window !== "undefined" ? window['angular'] : typeof global !== "undefined" ? global['angular'] : null);

angular.module('Endev').directive("value",['$compile',function($compile){
  return {
    priority: 1000,
    terminal:true,
    compile: function(tElement,tAttributes) {
      if(tAttributes.$attr["value"]==="data-value"){
        tElement.attr("ng-model", tAttributes.value);
        tElement.removeAttr("data-value");
      }
      return {
        pre: function preLink(scope, iElement, iAttrs, controller) {  },
        post: function postLink(scope, iElement, iAttrs, controller) {
          if(iAttrs.$attr["value"]==="data-value"){
            $compile(iElement)(scope);
          }
        }
      };
    }
  }
}]);
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],14:[function(require,module,exports){
(function (global){
var angular = (typeof window !== "undefined" ? window['angular'] : typeof global !== "undefined" ? global['angular'] : null);
var _ = (typeof window !== "undefined" ? window['_'] : typeof global !== "undefined" ? global['_'] : null);

_.each([['if','ng-show'],['click','ng-click']],function(pair){
  angular.module('Endev').directive(pair[0],['$compile',function($compile){
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
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],15:[function(require,module,exports){
(function (global){
var angular = (typeof window !== "undefined" ? window['angular'] : typeof global !== "undefined" ? global['angular'] : null);

var endevModule;
// Load templates
//require('./../tmp/templates.js');
var modulesToLoad = ["endev-templates"];
if(window.endevAngularModulesToLoad && angular.isArray(window.endevAngularModulesToLoad)){
  modulesToLoad = modulesToLoad.concat(window.endevAngularModulesToLoad);
}

//checking if angularFire is loaded
try{
  (typeof window !== "undefined" ? window['angularfire'] : typeof global !== "undefined" ? global['angularfire'] : null);
  endevModule = angular.module("Endev", modulesToLoad.concat("firebase"));
  require('./providers/firebase')
} catch(err) {
  endevModule = angular.module("Endev", modulesToLoad);
}


// Load factories
require('./factories/expr.js')

// Load attributes (i.e. angular directives)
require('./attributes/deleteFrom.js')
require('./attributes/describe.js')
require('./attributes/drag.js')
require('./attributes/drop.js')
require('./attributes/edit.js')
require('./attributes/else.js')
require('./attributes/explain.js')
require('./attributes/from.js')
require('./attributes/import.js')
require('./attributes/insertInto.js')
require('./attributes/new.js')
require('./attributes/value.js')
require('./attributes/wrappers.js')

// Load providers
require('./providers/provider.js')
require('./providers/local.js')
require('./providers/yql.js')
require('./providers/rest.js')


//The basic run
endevModule.run(["$rootScope","$document","$templateCache",function($rootScope,$document,$templateCache){
  $rootScope.Date = Date;
  $rootScope.Math = Math;
  $rootScope.$now = function() {
    return new Date();
  }
  $rootScope.$endevAnnotation = false;
  $rootScope.$endevErrors = []
  if(window.endev && window.endev.logic) angular.extend($rootScope,window.endev.logic);
  angular.element($document[0].body)
    .attr("ng-class","{'__endev_annotation_on__':$endevAnnotation}")
    .append(require("./templates/annotations.html"));
  if(!(window.endev && !window.endev.showHelper)){
    $rootScope.$endevShowHelper = true;
  }
}]);
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./attributes/deleteFrom.js":2,"./attributes/describe.js":3,"./attributes/drag.js":4,"./attributes/drop.js":5,"./attributes/edit.js":6,"./attributes/else.js":7,"./attributes/explain.js":8,"./attributes/from.js":9,"./attributes/import.js":10,"./attributes/insertInto.js":11,"./attributes/new.js":12,"./attributes/value.js":13,"./attributes/wrappers.js":14,"./factories/expr.js":16,"./providers/firebase":18,"./providers/local.js":21,"./providers/provider.js":22,"./providers/rest.js":23,"./providers/yql.js":24,"./templates/annotations.html":25}],16:[function(require,module,exports){
(function (global){
var angular = (typeof window !== "undefined" ? window['angular'] : typeof global !== "undefined" ? global['angular'] : null);

var COMPARISON_REGEX = new RegExp(/[=!><]+| (?:NOT )?LIKE | (?:NOT )?IN | IS (?:NOT )?NULL | (?:NOT )?MATCHES /);

angular.module('Endev').factory("Expr",[function(){
  function Expr(expr,label) {
    this.expression = expr;
    this.lhs = expr.split(COMPARISON_REGEX)[0].trim();
    this.rhs = expr.split(COMPARISON_REGEX)[1].trim();
    this.operator = COMPARISON_REGEX.exec(expr);
    this.attribute = this.lhs == label ? "" : this.lhs.replace(new RegExp("^" + label + ".", "g"),"");
    this.setValue = function(value) {
      this.value = value;
      if(this.attribute != "") {
        this.obj = _.reduceRight(this.attribute.split("."),function(memo,id){ var result = {}; result[id] = memo; return result}, value);
      } else {
        this.obj = value;
      }
      return value;
    }
    this.replace = function(value) {
      return (this.attribute || this.lhs) + this.operator + value;
    }
  }
  return Expr;
}]);
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],17:[function(require,module,exports){
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
},{"./attributes/import":10,"./endev":15,"./utils":26}],18:[function(require,module,exports){
(function (global){
var angular = (typeof window !== "undefined" ? window['angular'] : typeof global !== "undefined" ? global['angular'] : null);
var utils = require('./../utils');
var unwatch = require('./helpers/unwatchCache.js');
var generalDataFilter = require('./helpers/generalDataFilter.js');
var Firebase = (typeof window !== "undefined" ? window['Firebase'] : typeof global !== "undefined" ? global['Firebase'] : null);

angular.module('Endev').service("$endevFirebase",['$q','$firebaseObject','$firebaseArray', function($q,$firebaseObject,$firebaseArray){
  var ref = endev && endev.firebaseProvider && endev.firebaseProvider.path ? new Firebase(endev.firebaseProvider.path) : new Firebase("https://endev.firebaseio.com");

  function getObjectRef(type,parentLabel,parentObject,parentData){
    if(parentData){
      // var key = _.findKey(parentData,function(value){return value == parentObject}) 
      var key = parentObject.$id
      var path = parentLabel ? key + "/" + type.substring(parentLabel.length + 1) : key ;
      console.log("Path with parent:",path);
      return objectRef(parentData.$ref,path);
    } else {
      return objectRef(ref,type);
    }
  }

  var objectRef = function(ref,path){
    if(path) return ref.child(path.replace(".","/"));
    return null;
  };

  function filterData(data,attrs){
    var results = generalDataFilter(data,attrs);

    results.$endevProviderType = "firebase";
    results.$ref = data.$ref()

    return results;
  }

  var unwatchCache = new unwatch();

  return {
    query: function(attrs,extraAttrs,callback) {
      var result = $q.defer();
      var from = attrs.from.slice(attrs.from.indexOf(":")+1);
      unwatchCache.unwatch(callback);
      var objRef = getObjectRef(from,attrs.parentLabel,attrs.parentObject,attrs.parentData);
      // TODO  need to add a watcher for the result and then update the value somehow
      $firebaseArray(objRef).$loaded().then(function(data){

        console.log("Data:",data)
        var object = filterData(data,attrs);
        // if(object.length === 0 && attrs.autoInsert) {
        //   data.$add(attrs.filter)
        // }
        object.$endevRef = objRef;
        object.$add = function(addObj){
          data.$add(addObj);
        }
        console.log("Object:",object)
        if(callback && angular.isFunction(callback)) callback(object,data);
        else result.resolve(object);
        var updateCallback = function(){
          console.log("Data changed:", data, attrs.where);
          object = filterData(data,attrs);
          if(callback && angular.isFunction(callback)) callback(object);
          _.each(object,function(value){value.$$endevCallback = updateCallback});
        }
        _.each(object,function(value){value.$$endevCallback = updateCallback});
        unwatchCache.find(callback).unwatch = data.$watch(updateCallback);
      });

      return result.promise;
    },
    update: function(attrs) {
      var from = attrs.from.slice(attrs.from.indexOf(":")+1);
      var objRef = getObjectRef(from,attrs.parentLabel,attrs.parentObject,attrs.parentData);
      if(objRef){
        if(attrs.updatedObject.$id) {
          $firebaseObject(objRef).$loaded().then(function(parent){
            var object = $firebaseObject(parent.$ref().child(attrs.updatedObject.$id));
            utils.merge(object,attrs.updatedObject);
            object.$save();
            if(object.$$endevCallback && angular.isFunction(object.$$endevCallback)) object.$$endevCallback(object);
          });
        } else {
          $firebaseArray(objRef).$loaded().then(function(list){
            list.$add(attrs.updatedObject);
          })
        }
      }
    },
    insert: function(attrs) {
      var result = $q.defer();
      var insertInto = attrs.insertInto.slice(attrs.insertInto.indexOf(":")+1);
      var objRef = getObjectRef(insertInto,attrs.parentLabel,attrs.parentObject,attrs.parentData);
      
      objRef.push(attrs.newObject).once('value',function(value){
        result.resolve(value.val());
      });
      return result.promise;
    },
    remove: function(attrs) {
      var removeFrom = attrs.removeFrom.slice(attrs.removeFrom.indexOf(":")+1);
      var objRef = getObjectRef(removeFrom,attrs.parentLabel,attrs.parentObject,attrs.parentData);
      objRef.child(attrs.newObject.$id).remove();
    },
    bind: function(attrs) {
      var from = attrs.from.slice(attrs.from.indexOf(":")+1);
      var objRef = getObjectRef(from,null,attrs.object,attrs.data);
      if(objRef) $firebaseObject(objRef).$bindTo(attrs.scope,attrs.label)
    }

  }
}]);
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./../utils":26,"./helpers/generalDataFilter.js":19,"./helpers/unwatchCache.js":20}],19:[function(require,module,exports){
(function (global){
var _ = (typeof window !== "undefined" ? window['_'] : typeof global !== "undefined" ? global['_'] : null);
var utils = require('./../../utils');

module.exports = function (data, attrs) {
  var results = [];
  var filter = attrs.filter;
  var inSetParams = _.filter(attrs.params,function(param) { return param.operator[0] == " IN " })
  var notEqual = _.filter(attrs.params,function(param) { return param.operator[0] == "!=" })
  var lgtComparison = _.filter(attrs.params,function(param) { return param.operator[0] == ">" || param.operator[0] == "<" || param.operator[0] == ">=" || param.operator[0] == "<=" })
  // var results = {}
  _.each(data,function(value, key){
    //var value = _.isUndefined(val.$value) ? val : val.$value;
    var equalId = false;
    if(value && filter && (value.$id && value.$id == filter.$id
      || (value.$$endevId && value.$$endevPath && value.$$endevId == filter.$$endevId && value.$$endevPath == filter.$$endevPath))){
      equalId = true;
    }

    // if(!key.indexOf("$")!==0 && utils.isMatchDeep(value,filter)){
    if(equalId || utils.isMatchDeep(value,filter)){
      // results[key] = value;
      results.push(value);
      //results.$objects.push(val);
    }
  });
  _.each(notEqual,function(param){
    results = _.filter(results,function(object){
      return utils.valueOnPath(object,param.lhs,true) != param.value;
    })
  })
  _.each(lgtComparison,function(param){
    results = _.filter(results,function(object){
      var value = utils.valueOnPath(object,param.lhs,true);
      switch (param.operator[0]){
        case ">":
          return value > param.value;
        case "<":
          return value < param.value;
        case ">=":
          return value >= param.value;
        case "<=":
          return value <= param.value;
      }
    })
  })
  _.each(inSetParams,function(param){
    results = _.filter(results,function(object){
      return _.contains(param.value,utils.valueOnPath(object,param.lhs,true));
    })
  });
  return results;
}
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./../../utils":26}],20:[function(require,module,exports){
(function (global){
var _ = (typeof window !== "undefined" ? window['_'] : typeof global !== "undefined" ? global['_'] : null);

module.exports = function() {
  var unwatch = []

  this.find = function(callback){
    var result = _.find(unwatch,function(item){
      return item.callback == callback;
    });
    if(!result){
      result = {
        callback:callback
      }
      unwatch.push(result);
    }
    return result;
  };

  this.unwatch = function (callback) {
    var fn = this.find(callback);
    if (fn.unwatch) fn.unwatch();
  }
}
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],21:[function(require,module,exports){
(function (global){
var angular = (typeof window !== "undefined" ? window['angular'] : typeof global !== "undefined" ? global['angular'] : null);
var _ = (typeof window !== "undefined" ? window['_'] : typeof global !== "undefined" ? global['_'] : null);
var utils = require('./../utils');
var unwatch = require('./helpers/unwatchCache.js');
var generalDataFilter = require('./helpers/generalDataFilter.js');

angular.module('Endev').service("$endevLocal",['$q','$window','$timeout',function($q,$window,$timeout){

  var observers = {};

  var getType = _.memoize(function(type){
    var result;
    if(utils.storageAvailable('localStorage') && localStorage.getItem(type)){
      result = JSON.parse(localStorage.getItem(type));
      //TODO what if not an object?
    } else {
      result = {};
    }
    if (_.isUndefined(result.$endevUniqId)) result.$endevUniqId = 0;
    return result;
  });

  var $watch = function(type, fn) {
    if (!observers[type]) observers[type] = [];
    observers[type].push(fn);
    return function(){
      observers[type].splice(observers[type].indexOf(fn),1);
    }
  }

  angular.element($window).on('storage',function(e){
    $timeout(function(){
      getType.cache = {};
      _.each(observers[e.key],function(fn){if(_.isFunction(fn)) fn()});
    })
  })

  var getData = function(path){
    if(path.indexOf(".")>0) {
      var type = getType(path.substring(0,path.indexOf(".")));
      return utils.valueOnPath(type,path,true);
    }
    return getType(path);
  }

  var getRefOrDefault = function(path){
    var original = getType(getTypeFromPath(path));
    if(path.indexOf(".")<0){
      return original;
    } else {
      var id = path.substring(path.lastIndexOf(".")+1);
      var parent = utils.valueOnPath(original,path.substring(0,path.lastIndexOf(".")),true);
      if(_.isUndefined(parent[id])) {
        parent[id] = {}
      }
      return parent[id];
    }
  }

  var getPath = function(from,parentObject) {
    from = from.slice(from.indexOf(":")+1);
    if (parentObject) {
      return parentObject.$$endevPath + "." + parentObject.$$endevId + "." +from.slice(from.indexOf(".")+1);
    } else {
      return from;
    }
  }

  var getTypeFromPath = function(path) {
    if(path.indexOf(".")>0)
      return path.substring(0,path.indexOf("."));
    return path;
  }

  var update = function(path, updatedItem) {
    var collection = getData(path);
    if(updatedItem.$$endevId) {
      var copy = angular.copy(updatedItem);
      _.each(_.keys(copy),function(key) { if(key.indexOf('$') == 0) delete copy[key]})
      utils.merge(collection[updatedItem.$$endevId], copy);
      save(path);
    } else {
      insert(path,updatedItem)
    }
  }

  var insert = function(path,item) {
    var collection = getRefOrDefault(path);
    var typeData = getType(getTypeFromPath(path));
    collection[++typeData.$endevUniqId] = angular.copy(item);
    save(path);
    return copyItem(item);
  }

  var remove = function(path,item){
    var collection = getData(path);
    delete collection[item.$$endevId];
    save(path);
  }

  var save = function(path){
    _.each(observers[path],function(fn){if(_.isFunction(fn)) fn()});
    if(utils.storageAvailable('localStorage')){
      var type = getTypeFromPath(path);
      localStorage.setItem(type,JSON.stringify(getType(type),function(key,value){
        if (key == '$watch') return undefined;
        return value;
      }));
    }
  }

  var copyItem = function(value,key,path) {
    var newValue;
    if(_.isObject(value) || _.isArray(value)){
      newValue = angular.copy(value);
    } else {
      newValue = {};
      newValue.$value = value;
    }
    newValue.$$endevId = key;
    newValue.$$endevPath = path;
    return newValue;
  }

  var copyCollection = function(path) {
    var data = getData(path);
    var result = [];
    _.each(data,function(value,key){
      if (key.indexOf('$')!==0) {
        result.push(copyItem(value,key,path));
      }
    })
    return result;
  }

  var unwatchCache = new unwatch();

  return {
    query:function(attrs,extraAttrs,callback){
      var result = $q.defer();
      var path = getPath(attrs.from,attrs.parentObject);
      unwatchCache.unwatch(callback);
      var data = copyCollection(path);
      var object = generalDataFilter(data,attrs);
      if(callback && angular.isFunction(callback)) callback(object,data);
      else result.resolve(object);
      unwatchCache.find(callback).unwatch = $watch(path, function(){
        var data = copyCollection(path);
        var object = generalDataFilter(data,attrs);
        if(callback && angular.isFunction(callback)) callback(object);
      });
      return result.promise;
    },
    update:function(attrs){
      update(getPath(attrs.from,attrs.parentObject), attrs.updatedObject);
    },
    insert:function(attrs){
      var result = $q.defer();
      result.resolve(insert(getPath(attrs.insertInto,attrs.parentObject),attrs.newObject));
      return result.promise;
    },
    remove:function(attrs){
      remove(getPath(attrs.removeFrom,attrs.parentObject),attrs.newObject);
    },
    bind:function(attrs){
      attrs.scope.$watch(attrs.label,function(newValue, oldValue){
        if(newValue != oldValue){
          update(getPath(attrs.from,attrs.parentObject), newValue);
        }
      },true)
    }
  }
}]);
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./../utils":26,"./helpers/generalDataFilter.js":19,"./helpers/unwatchCache.js":20}],22:[function(require,module,exports){
(function (global){
var angular = (typeof window !== "undefined" ? window['angular'] : typeof global !== "undefined" ? global['angular'] : null);

var PATH_ROOT_REGEX = new RegExp(/^[a-zA-Z_$][0-9a-zA-Z_$]*/);
var PROTOCOL_REGEX = new RegExp(/^([a-zA-Z_$][0-9a-zA-Z_$]*):/);

angular.module('Endev').service("$endevProvider",['$injector', function($injector){
  return {
    getContext: function(name,path,element,scope) {
      var provider, parent;
      var name = name || (path.search(/http(s)?:\/\//) == 0 ? "rest" : (path.match(PROTOCOL_REGEX) || [null,null])[1]);
      if(name) {
        provider = $injector.get('$endev' + name[0].toUpperCase() + name.slice(1));
      } else {
        var pathRoot = path.match(PATH_ROOT_REGEX);
        if(pathRoot){
          provider = scope["$endevProvider_" + pathRoot[0]];
          if(!provider) {
            provider = $injector.get('$endevLocal');
            //throw new Error("No self or parent provider found for:", path, "on:", element);
          } else {
            parent = pathRoot[0];
          }
        }
      }
      return {
        provider: provider,
        parent: parent
      }
    }
  }
}]);
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],23:[function(require,module,exports){
(function (global){
var angular = (typeof window !== "undefined" ? window['angular'] : typeof global !== "undefined" ? global['angular'] : null);
var utils = require('./../utils.js')
var X2JS = require("x2js");
var generalDataFilter = require('./helpers/generalDataFilter.js');

angular.module('Endev').service("$endevRest", ['$http','$interpolate','$q', function($http,$interpolate,$q){

  function prependTransform(defaults, transform) {
    // We can't guarantee that the transform transformation is an array
    transform = angular.isArray(transform) ? transform : [transform];
    // Append the new transformation to the defaults
    return transform.concat(defaults);
  }

  return {
    query: function(attrs,extra,callback) {
      var from = attrs.from.slice(attrs.from.indexOf(":")+1);
      var result = $q.defer();
      if(attrs.parentLabel) {
        var tmp = utils.valueOnPath(attrs.parentObject, from, true);
        tmp = generalDataFilter(tmp,attrs);
        if(callback && angular.isFunction(callback)) callback(tmp)
        else result.resolve(tmp);
      } else {
        var where = "";
        for(var i = 0; i<attrs.params.length; i++) {
          where += attrs.params[i].attribute + "=" + encodeURIComponent(attrs.params[i].value);
          if(i < attrs.params.length-1) {
            where += "&";
          }
        }
        var config = {
          headers: angular.isString(attrs.headers) ? angular.fromJson(attrs.headers) :
            angular.isObject(attrs.headers) ? attrs.headers : undefined,
          transformResponse: prependTransform($http.defaults.transformResponse, function(data, headersGetter) {
            if (headersGetter()['content-type']=="application/atom+xml") {
              var x2js = new X2JS();
              return x2js.xml_str2json(data);
            } else {
              return data;
            }
          })
        }
        var url = attrs.from
        if (url.indexOf('?') != -1) {
          url = url + "&" + where;
        } else {
          url = url + "?" + where;
        }

        $http.get(url, config)
          .success(function(data){
            result.resolve(data);
          }).error(function(data){
          result.reject(data);
        });
      }
      return result.promise;
    }
  }
}]);
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./../utils.js":26,"./helpers/generalDataFilter.js":19,"x2js":1}],24:[function(require,module,exports){
(function (global){
var angular = (typeof window !== "undefined" ? window['angular'] : typeof global !== "undefined" ? global['angular'] : null);
var utils = require('./../utils');

angular.module('Endev').service("$endevYql", ['$http','$q', function($http,$q){
  return {
    query: function(attrs,extra,callback) {
      var from = attrs.from.slice(attrs.from.indexOf(":")+1);
      var result = $q.defer()
      if(attrs.parentLabel){
        var tmp = utils.valueOnPath(attrs.parentObject,from,true)
        if(callback && angular.isFunction(callback)) callback(tmp)
        else result.resolve(tmp);
      }else{
        var where = attrs.where;
        for(var i = 0; i<attrs.params.length; i++) {
          where = where.replace(attrs.params[i].expression, attrs.params[i].replace("'" + attrs.params[i].value + "'"));
        }
        var query;
        if(attrs.use) {
          query = "use '" + attrs.use + "' as tmpTable; select * from tmpTable";
        } else {
          query = "select * from " + from;
        }
        if(where) query += " where " + where;
        $http.get("https://query.yahooapis.com/v1/public/yql?q="
            + encodeURIComponent(query)
            + "&diagnostics=true&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys&format=json")
          .success(function(data){
            var d = data.query.results;
            if(attrs.use && from.indexOf(".")>=0) {
              d = utils.valueOnPath(data.query.results,from,true);
            }
            console.log("Data:",d);
            result.resolve(d);
          }).error(function(data){
          result.reject(data.error);
        });
      }
      return result.promise

    },
    desc: function(table){
      var result = $q.defer();
      $http.get("https://query.yahooapis.com/v1/public/yql?q="
          + encodeURIComponent("desc " + table)
          + "&diagnostics=true&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys&format=json")
        .success(function(data){
          var d = data.query.results.table;
          result.resolve(d);
        }).error(function(data){
        result.reject(data.error);
      });
      return result.promise;
    }

  }
}]);
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./../utils":26}],25:[function(require,module,exports){
module.exports = "<style>\n  #__endev_helper__ {  \n    position: fixed;  \n    bottom: 0;  \n    left: 0;  \n    right: 0;  \n    background: #E0E0E0;  \n    border-top: 1px solid #929292;  \n    padding: 5px;  \n    font-family: sans-serif;  \n    font-size: 12px;  \n  }  \n\n  .__endev_annotation_on__ .__endev_annotated__ { \n    outline: 1px solid rgba(255,0,0,0.5); \n    /*border: 1px solid rgba(255,0,0,0.5); */\n    padding-top: 15px; \n    margin-top:5px;\n    display:block; \n  } \n\n  .__endev_annotation_on__ tbody.__endev_annotated__ {\n    display: table-row-group;\n  }\n  .__endev_annotation__ { \n    display: none; \n  }\n  .__endev_annotation_on__ .__endev_annotated__ > .__endev_annotation__ { \n    display: block; \n    position: absolute; \n    margin-top: -22px; \n    font-size: 10px; \n    font-family: monospace; \n    background: #FFFFD1; \n    color: #666; \n    padding: 1px 3px; \n    border: 1px dashed rgba(255,0,0,0.5); \n    margin-left: 5px; \n    cursor: pointer; \n  } \n  .__endev_annotated__ > .__endev_annotation__:hover { \n    background: rgba(255,255,125,0.9); \n  } \n  .__endev_annotated__ > .__endev_list_item_annotated__ { \n    outline: 1px dashed rgba(255,0,0,0.5); \n  } \n  table.__endev_annotated__, thead.__endev_annotated__, tbody.__endev_annotated__, tfoot.__endev_annotated__  { \n    /*border: 1px solid red;*/\n    padding-top: 10px; \n    margin-top: 10px; \n  } \n  table .__endev_annotated__ > .__endev_annotation__ { \n    margin-top: -1px; \n  }\n  ._endev_json_ {\n\n  }\n  ._endev_json_number_ {\n    color: forestgreen;\n  }\n  ._endev_json_key_ {\n    color: darkorange;\n  }\n  ._endev_json_string_ {\n    color: darkseagreen;\n  }\n  ._endev_json_boolean_ {\n    color: green;\n  }\n  ._endev_json_null_ {\n    color: dimgray;\n  }\n</style>\n<div id=\"__endev_helper__\" ng-if=\"$endevShowHelper\">\n  Endev Tools:\n  <button ng-click=\"$endevAnnotation = !$endevAnnotation\">Annotations {{$endevAnnotation ? 'off' : 'on'}}</button>\n  <span style=\"color:red\">{{$endevErrors[$endevErrors.length-1].description}}</span>\n</div>";

},{}],26:[function(require,module,exports){
(function (global){
_ = (typeof window !== "undefined" ? window['_'] : typeof global !== "undefined" ? global['_'] : null);

var utils = {}

// Deep merge
utils.merge = function(obj, depth) {
  var parentRE = /#{\s*?_\s*?}/,
  slice = Array.prototype.slice;
 
  _.each(slice.call(arguments, 1), function(source) {
    for (var prop in source) {
      if (_.isNull(obj[prop]) || _.isUndefined(obj[prop]) || _.isFunction(obj[prop]) || _.isNull(source[prop]) || _.isDate(source[prop])) {
        obj[prop] = source[prop];
      }
      else if (_.isString(source[prop]) && parentRE.test(source[prop])) {
        if (_.isString(obj[prop])) {
          obj[prop] = source[prop].replace(parentRE, obj[prop]);
        }
      }
      else if (_.isArray(obj[prop]) || _.isArray(source[prop])){
        if (!_.isArray(obj[prop]) || !_.isArray(source[prop])){
          throw new Error('Trying to combine an array with a non-array (' + prop + ')');
        } else {
          obj[prop] = _.reject(utils.merge(_.clone(obj[prop]), source[prop]), function (item) { return _.isNull(item);});
        }
      }
      else if (_.isObject(obj[prop]) || _.isObject(source[prop])){
        if (!_.isObject(obj[prop]) || !_.isObject(source[prop])){
          throw new Error('Trying to combine an object with a non-object (' + prop + ')');
        } else {
          obj[prop] = utils.merge(_.clone(obj[prop]), source[prop]);
        }
      } else {
        obj[prop] = source[prop];
      }
    }
  });
  return obj;
};

utils.isMatchDeep = function(object, attrs) {
  attrs = _.extendOwn({},attrs);
  var keys = _.keys(attrs), length = keys.length;
  if (object == null) return !length;
  var obj = Object(object);
  for (var i = 0; i < length; i++) {
    var key = keys[i];
    if (_.isObject(attrs[key])) {
      if (!utils.isMatchDeep(object[key],attrs[key])) return false;
    } else {
      if (attrs[key] !== obj[key] || !(key in obj)) return false;
    }
  }
  return true;
};

utils.valueOnPath = function(object,path,removeRoot) {
  if(removeRoot && path.indexOf(".") < 0) return object;
  return _.reduce((removeRoot ? path.substring(path.indexOf(".")+1) : path).split("."),function(memo,id){
    return (angular.isDefined(memo) && memo != null) ? memo[id] : null;
  },object)
}

utils.syntaxHighlight = function(json) {
  json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
    var cls = '_endev_json_number_';
    if (/^"/.test(match)) {
      if (/:$/.test(match)) {
        cls = '_endev_json_key_';
      } else {
        cls = '_endev_json_string_';
      }
    } else if (/true|false/.test(match)) {
      cls = '_endev_json_boolean_';
    } else if (/null/.test(match)) {
      cls = '_endev_json_null_';
    }
    return '<span class="' + cls + '">' + match + '</span>';
  });
}

utils.storageAvailable = function(type) {
  try {
    var storage = window[type],
        x = '__storage_test__';
    storage.setItem(x, x);
    storage.removeItem(x);
    return true;
  }
  catch(e) {
    return false;
  }
}

utils.removeFn = function(removeFrom,object,parent,scope,provider) {
  console.log("Removing:",object);
  var queryParameters = {removeFrom:removeFrom,newObject:object};

  if (parent) {
    queryParameters.parentLabel = parent;
    queryParameters.parentObject = scope[parent];
    queryParameters.parentData = scope["$endevData_" + parent];
  }

  provider.remove(queryParameters)
}

module.exports = utils
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}]},{},[17])(17)
});


//# sourceMappingURL=endev.js.map
