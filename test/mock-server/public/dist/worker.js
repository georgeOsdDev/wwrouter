(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/*
* WWRouter.worker
* https://github.com/georgeosddev/WWRouter
*
* license   The MIT License (MIT)
* copyright Copyright (c) 2015 Takeharu Oshida <georgeosddev@gmail.com>
*/
var Utils = require("./utils.js");

function http(request, seq){
  "use strict";
  var response = {
    seq:seq,
    evt:"http."+request.method
  };
  Utils.ajax(request)
      .then(function(result){
        response.data = result;
        response.err  = 0;
        self.postMessage(Utils.serialize(response));
      })
      .catch(function(result){
        response.data = result;
        response.err  = 1;
        self.postMessage(Utils.serialize(response));
      });
}
//
self.addEventListener("message", function(e) {
  "use strict";
  var data = Utils.deserialize(e.data);
  var response = {};
  switch (data.evt) {
    case "cmd.init":
      self.name = data.param.name;
      self.url  = data.param.url;
      break;
    case "cmd.stop":
      self.close(); // Terminates the worker.
      break;
    case "http.get":
      http({
        "method":"get",
        "url":self.url,
        "data":data.param
      }, data.seq);
      break;
    case "http.post":
      http({
        "method":"post",
        "url":self.url,
        "data":data.param
      }, data.seq);
      break;
    case "http.put":
      http({
        "method":"put", // will be used as _method parameter
        "url":self.url,
        "data":data.param
      }, data.evt, data.seq);
      break;
    case "http.delete":
      http({
        "method":"delete", // will be used as _method parameter
        "url":self.url,
        "data":data.param
      }, data.seq);
      break;
    case "ws.open":
      self.sock = new WebSocket(self.url);
      self.sock.onopen = function(){
        response = {
          seq:data.seq,
          evt:"ws.open",
          data: {},
          err: 0
        };
        console.log("onopen");
        self.postMessage(Utils.serialize(response));
      };
      self.sock.onclose = function(){
        response = {
          evt:"ws.close",
          data: {}
        };
        self.postMessage(Utils.serialize(response));
      };
      self.sock.onmessage = function(e){
        response = {
          evt:"ws.message",
          data: e.data
        };
        console.log("onmessage", response);
        self.postMessage(Utils.serialize(response));
      };
      break;
    case "ws.close":
      if (self.sock){
        self.sock.close();
        response = {
          seq:data.seq,
          evt:"ws.close",
          data: {},
          err: 0
        };
        self.postMessage(Utils.serialize(response));
      }
      break;
    case "ws.send":
      if (self.sock){

        var msg = data.param;
        if (typeof msg !== "string"){
          msg = JSON.stringify(msg);
        }

        self.sock.send(msg);
        response = {
          seq:data.seq,
          evt:"ws.send",
          data: {},
          err: 0
        };
        self.postMessage(Utils.serialize(response));
      }
      break;
    default:
      // ignore
  }
}, false);
},{"./utils.js":2}],2:[function(require,module,exports){
/*
 * WWRouter.utils
 * https://github.com/georgeosddev/WWRouter
 *
 * license   The MIT License (MIT)
 * copyright Copyright (c) 2015 Takeharu Oshida <georgeosddev@gmail.com>
 */
(function(global) {
  "use strict";

  var uuid = (function() {
    function s4() {
      return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
    }
    return function() {
      return s4() + s4() + "-" + s4() + "-" + s4() + "-" + s4() + "-" + s4() + s4() + s4();
    };
  })();


  function ab2str(buf) {

    if (typeof Uint16Array === "undefined") return buf;

    return String.fromCharCode.apply(null, new Uint16Array(buf));
  }

  function str2ab(str) {
    if (typeof Uint16Array === "undefined") return str;

    var buf = new ArrayBuffer(str.length * 2); // 2 bytes for each char
    var bufView = new Uint16Array(buf);
    for (var i = 0, strLen = str.length; i < strLen; i++) {
      bufView[i] = str.charCodeAt(i);
    }
    return bufView.buffer;
  }

  function serialize(obj){
    return str2ab(JSON.stringify(obj));
  }

  function deserialize(buf){
    return JSON.parse(ab2str(buf));
  }

  function log(any){
    if (typeof console !== undefined && typeof console.log === "function") console.log(any);
  }

  function ajax(request){
    var p = new Promise(function(resolve, reject){
      var httpRequest = new XMLHttpRequest();
      httpRequest.onreadystatechange = function() {
        if (httpRequest.readyState === 4) {
          if (httpRequest.status === 200) {
            return resolve({status:httpRequest.status, body:httpRequest.responseText});
          } else {
            return reject({status:httpRequest.status, body:httpRequest.responseText});
          }
        }
      };
      var method      = request.method.toUpperCase() === "GET" ? "GET" : "POST",
      url         = request.url,
      contentType = "application/x-www-form-urlencoded",
      data        = request.data || {}
      ;

      httpRequest.open(method, url, true);
      httpRequest.setRequestHeader("Content-Type", contentType);
      if (method === "POST"){

        var form = [];
        Object.keys(data).forEach(function (k) {
          form.push(k+"="+data[k]);
        })
        var formString = form.join("&");
        if (request.method !== "POST") formString += "&_method="+request.method;
        httpRequest.send(formString);
      } else {
        httpRequest.send();
      }
    });
    return p;
  }

  var Utils = {
    uuid:uuid,
    ab2str:ab2str,
    serialize:serialize,
    deserialize:deserialize,
    log:log,
    ajax:ajax
  };

  if (typeof exports !== "undefined") {
    if (typeof module !== "undefined" && module.exports) {
      module.exports = Utils;
    }
    exports.Utils = Utils;
  } else {
    global.Utils = Utils;
  }

})(this);

},{}]},{},[1])