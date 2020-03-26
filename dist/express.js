'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _expressLoad = require('express-load');

var _expressLoad2 = _interopRequireDefault(_expressLoad);

var _cookieParser = require('cookie-parser');

var _cookieParser2 = _interopRequireDefault(_cookieParser);

var _expressFileupload = require('express-fileupload');

var _expressFileupload2 = _interopRequireDefault(_expressFileupload);

var _morgan = require('morgan');

var _morgan2 = _interopRequireDefault(_morgan);

var _helmet = require('helmet');

var _helmet2 = _interopRequireDefault(_helmet);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _rotatingFileStream = require('rotating-file-stream');

var _rotatingFileStream2 = _interopRequireDefault(_rotatingFileStream);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var bodyParser = require('body-parser');

var Express = function () {

    /**
     * Construtor do servidor com aplicação express
     * Utilize dos diretórios abaixo par o desenvolvimento da sua aplicação:
     * 
     * /models
     * /controllers
     * /tools
     * /routers
     * 
     * @constructor
     * @param {object} conf - O conteúdo do arquivo de configuração
     */
    function Express(conf) {
        _classCallCheck(this, Express);

        console.log("[Express]", "Iniciando Framework");
        this.app = (0, _express2.default)();

        this.configurations = conf;

        this.setCors();
        this.setLogging();
        this.basicLoad();
        this.setPublicPath();

        return this.app;
    }

    /**
     * Configura o diretório public com base no arquivo de configurção
     * O diretório estatico será definido na propiedade 'server.staticPath'
     * caso esta estiver definida como false o diretório estático será 
     * definido como: './public'
     */


    _createClass(Express, [{
        key: 'setPublicPath',
        value: function setPublicPath() {
            this.app.use(_express2.default.static(this.configurations.server.staticPath ? this.configurations.server.staticPath : "./public"));
        }
        /**
         * Carrega as diretivas e middlewares basicos do express
         */

    }, {
        key: 'basicLoad',
        value: function basicLoad() {
            //Carrega configuração para dentro da aplicação
            this.app.set('config', this.configurations);

            //Interpreta cookie e injeta na requisição
            this.app.use((0, _cookieParser2.default)());

            //Interpreta body params e injeta na requisição
            this.app.use(bodyParser.json());
            this.app.use(bodyParser.urlencoded({ extended: true }));

            //Recebe arquivos e injeta na requisição
            this.app.use((0, _expressFileupload2.default)());

            // Carrega os diretórios base da aplicação
            (0, _expressLoad2.default)('models', { cwd: 'src' }) //Diretório de Modelos de dados (Modelo MongoDB com biblioteca Mongoose)
            .then('controllers') //Diretório de controladores da aplicação
            .then('tools') //Diretório de extras de ferramentas para a aplicação
            .then('routes') //Diretório de documentos de rotas
            .into(this.app);
        }

        /**
         * Define os parâmetros de segurança da aplicação via HelmetJS
         */

    }, {
        key: 'setSecurity',
        value: function setSecurity() {
            var self = this;

            //Iniciao o HelmetJS
            this.app.use((0, _helmet2.default)());

            //Desabilita os cabeçalhos listados na configuração
            this.configurations.security.disabledHeader.forEach(function (e) {
                self.app.disable(e);
            });

            //Modifica o PoweredBy para a string desejada
            if (this.configurations.security.hidePoweredBy) {
                this.app.use(_helmet2.default.hidePoweredBy(this.configurations.security.hidePoweredBy));
            }

            //Bloqueia tentativas de XSS
            if (this.configurations.security.blockXSS) {
                this.app.use(_helmet2.default.xssFilter());
            }

            //Bloqueia tentativas de Sniff
            if (this.configurations.security.nosniff) {
                this.app.use(_helmet2.default.noSniff());
            }
        }

        /**
         * Define o nivel de log e se o log vai ser na tela ou em arquivo
         */

    }, {
        key: 'setLogging',
        value: function setLogging() {
            if (this.configurations.server.logging.file) {
                var logDir = _path2.default.join(__dirname, '..', 'log');
                _fs2.default.existsSync(logDir) || _fs2.default.mkdirSync(logDir);

                var accessLogStream = (0, _rotatingFileStream2.default)('access.log', {
                    interval: '1d',
                    path: logDir
                });

                this.app.use((0, _morgan2.default)(this.configurations.server.logging.level, {
                    stream: accessLogStream
                }));
            } else {
                this.app.use((0, _morgan2.default)(this.configurations.server.logging.level));
            }
        }

        /**
         * Responde filtro cors
         */

    }, {
        key: 'setCors',
        value: function setCors() {
            this.app.use(function (req, res, next) {

                res.header("Access-Control-Allow-Methods", "POST, GET, PUT, DELETE, OPTIONS");
                res.header("Access-Control-Allow-Origin", "http://localhost:3000");
                res.header("Access-Control-Allow-Credentials", "false");
                res.header("Access-Control-Expose-Headers", "X-Request-Width, Content-Type, X-Codingpedia, Credentials, Origin");
                res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

                if(req.method === "OPTIONS") return res.status(204).send();

                next();
            });
        }
    }]);

    return Express;
}();

exports.default = Express;