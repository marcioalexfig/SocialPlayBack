'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _http = require('http');

var _http2 = _interopRequireDefault(_http);

var _express = require('./express');

var _express2 = _interopRequireDefault(_express);

var _mongodb = require('./database/mongodb');

var _mongodb2 = _interopRequireDefault(_mongodb);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

const env = process.env.amb;
//var env = 'local';
var config = require("./config/application." + env + ".json");

var Main = function () {
  function Main() {
    _classCallCheck(this, Main);

    if (config.database.mongodb) {
      new _mongodb2.default(config.database.mongodb);
    }
    var app = new _express2.default(config);
    this.startServer(app);
  }

  _createClass(Main, [{
    key: 'startServer',
    value: function startServer(app) {
      console.log('[Servidor]', 'Iniciado na porta servidor...');
      _http2.default.createServer(app).listen(config.server.port, function () {
        console.log('[Servidor]', 'Iniciado na porta ' + config.server.port);
      });
    }
  }]);

  return Main;
}();

new Main();