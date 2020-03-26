'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

_mongoose2.default.Promise = _bluebird2.default;

var MongoDB = function () {
    function MongoDB(dbconf) {
        _classCallCheck(this, MongoDB);

        this.uri = this.constructURI(dbconf);
        console.log("[MongoDB]", 'Conectando com: ' + this.uri);
        this.connectWithRetry();
    }

    _createClass(MongoDB, [{
        key: 'constructURI',
        value: function constructURI(dbconf) {
            var uri = "mongodb://";

            if (dbconf.user) {
                if (dbconf.pass) {
                    uri += dbconf.user + ':' + dbconf.pass + '@';
                }
            }

            uri += dbconf.addr;

            if (dbconf.port) {
                uri += ':' + dbconf.port;
            }

            uri += '/' + dbconf.db;

            return uri;
        }
    }, {
        key: 'connectWithRetry',
        value: function connectWithRetry() {
            var self = this;
            return _mongoose2.default.connect(this.uri, { useMongoClient: true }, function (err) {
                if (err) {
                    console.error("[MongoDB]", "Falha ao se conectar com o servidor mongo - tentando novamente em 5 segundos...", err);
                    setTimeout(self.connectWithRetry, 5000);
                }
                console.log("[MongoDB]", "Conectado!");
            });
        }
    }, {
        key: 'activateEventsListners',
        value: function activateEventsListners() {
            var self = this;

            //Exibe erro no banco de dados e tenta reconectar
            _mongoose2.default.connection.on("error", function (err) {
                console.error('[MongoDB]', 'Erro: ' + err);
                _mongoose2.default.disconnect();
                self.connectWithRetry();
            });

            process.on('SIGINT', function () {
                _mongoose2.default.connection.close(function () {
                    console.log("[MongoDB]", "Mensagem: MongoDB desconectado pelo termino da aplicação.");
                    process.exit(0);
                });
            });
        }
    }]);

    return MongoDB;
}();

exports.default = MongoDB;