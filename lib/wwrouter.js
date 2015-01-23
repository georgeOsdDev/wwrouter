/*
 * WWRouter
 * https://github.com/georgeosddev/WWRouter
 *
 * license   The MIT License (MIT)
 * copyright Copyright (c) 2015 Takeharu Oshida <georgeosddev@gmail.com>
 */
(function() {
  "use strict";
  var events = require("events"),
    util = require("util"),
    Utils = require("./utils");

  var WWRouter = function() {
    this.routes = {};
  };

  WWRouter.prototype.route = function(url, param, src) {
    var workerJS = src || "./worker.js";

    if (param) {

      var tokens = url.split("/");
      Object.keys(param).forEach(function(k) {
        var idx = tokens.indexOf(":" + k);
        if (idx > -1) {
          tokens[idx] = param[k];
        }
      });
      url = tokens.join("/");
    }

    var worker = new Worker(workerJS);
    this.routes[url] = worker;
    var route = new Route(worker, url);
    route.on("error", function(data){
      Utils.log("WWRouteError:", data);
    });
    return route;
  };

  var Route = function(worker, url) {
    this.worker = worker;
    this.url = url;
    this.requests = {};
    this.seq = 0;

    var self = this;

    function resolve(id, data) {
      if (self.requests[id] && typeof self.requests[id].resolve === "function") {
        self.requests[id].resolve(data);
      }
    }

    function reject(id, data) {
      if (self.requests[id] && typeof self.requests[id].reject === "function") {
        self.requests[id].reject(data);
      }
    }

    worker.addEventListener("message", function(e) {
      var result = Utils.deserialize(e.data);

      if (result.evt === "error") {
        self.emit("error", result.data);
      } else if (result.evt === "ws.open") {
        self.emit("open");
      } else if (result.evt === "ws.close") {
        self.emit("close");
      } else if (result.evt === "ws.message") {
        self.emit("message", result.data);
      }

      if (result.seq) {
        if (result.err) {
          reject(result.seq, result.data);
        } else {
          resolve(result.seq, result.data);
        }
      }
    }, false);

    worker.addEventListener("error", function(e) {
      Utils.log(e);
      self.emit("error", e);
    }, false);

    worker.postMessage(Utils.serialize({
      "evt": "cmd.init",
      "param": {
        "url": url
      }
    }));
  };
  util.inherits(Route, events.EventEmitter);

  Route.prototype._nextSeq = function() {
    this.seq++;
    return this.seq;
  };

  Route.prototype._makeRequest = function(data) {
    var self = this;
    var p = new Promise(function(resolve, reject) {
      self.requests[data.seq] = {
        resolve: resolve,
        reject: reject,
      };
    });
    this.worker.postMessage(Utils.serialize(data));
    return p;
  };

  Route.prototype._makeHTTPRequest = function(method, param) {
    var data = {
      evt: "http." + method,
      method: method,
      seq: this._nextSeq(),
      param: param
    };
    return this._makeRequest(data);
  };

  Route.prototype._makeWSRequest = function(method, param) {
    var data = {
      evt: "ws." + method,
      seq: this._nextSeq(),
      param: param
    };
    return this._makeRequest(data);
  };

  Route.prototype.get = function(param) {
    return this._makeHTTPRequest("get", param);
  };
  Route.prototype.post = function(param) {
    return this._makeHTTPRequest("post", param);
  };
  Route.prototype.put = function(param) {
    return this._makeHTTPRequest("put", param);
  };
  Route.prototype.delete = function(param) {
    return this._makeHTTPRequest("delete", param);
  };
  Route.prototype.open = function() {
    return this._makeWSRequest("open");
  };
  Route.prototype.close = function() {
    return this._makeWSRequest("close");
  };
  Route.prototype.send = function(param) {
    return this._makeWSRequest("send", param);
  };

  window.WWRouter = new WWRouter();
})();