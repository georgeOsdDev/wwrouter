/*
 * WWRouter.worker
 * https://github.com/georgeosddev/WWRouter
 *
 * license   The MIT License (MIT)
 * copyright Copyright (c) 2015 Takeharu Oshida <georgeosddev@gmail.com>
 */
var Utils = require("./utils.js");

function http(request, seq) {
    "use strict";
    var response = {
      seq: seq,
      evt: "http." + request.method
    };
    Utils.ajax(request)
      .then(function(result) {
        response.data = result;
        response.err = 0;
        self.postMessage(Utils.serialize(response));
      })
      .catch(function(result) {
        response.data = result;
        response.err = 1;
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
      self.url = data.param.url;
      break;
    case "cmd.stop":
      self.close(); // Terminates the worker.
      break;
    case "http.get":
      http({
        "method": "get",
        "url": self.url,
        "data": data.param
      }, data.seq);
      break;
    case "http.post":
      http({
        "method": "post",
        "url": self.url,
        "data": data.param
      }, data.seq);
      break;
    case "http.put":
      http({
        "method": "put", // will be used as _method parameter
        "url": self.url,
        "data": data.param
      }, data.seq);
      break;
    case "http.delete":
      http({
        "method": "delete", // will be used as _method parameter
        "url": self.url,
        "data": data.param
      }, data.seq);
      break;
    case "ws.open":
      try {
        self.sock = new WebSocket(self.url);
        self.sock.onerror = function (error) {
          response = {
            seq: data.seq,
            err: 1,
            data: {
              code: error.code,
              name: error.name,
              message: error.message,
            }
          };
          self.postMessage(Utils.serialize(response));
        };
        self.sock.onopen = function() {
          response = {
            seq: data.seq,
            evt: "ws.open",
            data: {},
            err: 0
          };
          self.postMessage(Utils.serialize(response));
        };
        self.sock.onclose = function() {
          response = {
            evt: "ws.close",
            data: {}
          };
          self.postMessage(Utils.serialize(response));
        };
        self.sock.onmessage = function(e) {
          response = {
            evt: "ws.message",
            data: e.data
          };
          self.postMessage(Utils.serialize(response));
        };
      } catch (err) {
        response = {
          evt: "error",
          err: 1,
          data: {
            code: err.code,
            name: err.name,
            message: err.message,
          }
        };
        self.postMessage(Utils.serialize(response));
      }
      break;
    case "ws.close":
      if (self.sock) {
        self.sock.close();
        response = {
          seq: data.seq,
          evt: "ws.close",
          data: {},
          err: 0
        };
        self.postMessage(Utils.serialize(response));
      }
      break;
    case "ws.send":
      if (self.sock) {

        var msg = data.param;
        if (typeof msg !== "string") {
          msg = JSON.stringify(msg);
        }

        self.sock.send(msg);
        response = {
          seq: data.seq,
          evt: "ws.send",
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