/*
 * WWRouter.utils
 * https://github.com/georgeosddev/WWRouter
 *
 * license   The MIT License (MIT)
 * copyright Copyright (c) 2015 Takeharu Oshida <georgeosddev@gmail.com>
 */
(function(global) {
  "use strict";

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

  function serialize(obj) {
    return str2ab(JSON.stringify(obj));
  }

  function deserialize(buf) {
    return JSON.parse(ab2str(buf));
  }

  function log() {
    if (typeof console !== undefined && typeof console.log === "function")
      console.log.apply(console, Array.prototype.slice.apply(arguments));
  }

  function ajax(request) {
    var p = new Promise(function(resolve, reject) {
      var httpRequest = new XMLHttpRequest();
      httpRequest.onreadystatechange = function() {
        if (httpRequest.readyState === 4) {
          if (httpRequest.status === 200) {
            return resolve({
              status: httpRequest.status,
              body: httpRequest.responseText
            });
          } else {
            return reject({
              status: httpRequest.status,
              body: httpRequest.responseText
            });
          }
        }
      };
      var method = request.method.toUpperCase() === "GET" ? "GET" : "POST",
        url = request.url,
        contentType = "application/x-www-form-urlencoded",
        data = request.data || {};

      httpRequest.open(method, url, true);
      httpRequest.setRequestHeader("Content-Type", contentType);
      if (method === "POST") {

        var form = [];
        Object.keys(data).forEach(function(k) {
          form.push(k + "=" + data[k]);
        })
        var formString = form.join("&");
        if (request.method !== "POST") formString += "&_method=" + request.method;
        httpRequest.send(formString);
      } else {
        httpRequest.send();
      }
    });
    return p;
  }

  var Utils = {
    ab2str: ab2str,
    serialize: serialize,
    deserialize: deserialize,
    log: log,
    ajax: ajax
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