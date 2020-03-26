"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var DemoController = function () {
    function DemoController(app) {
        _classCallCheck(this, DemoController);

        this.Guardas = app.models.Guardas;

        this.getByCartao = this.getByCartao.bind(this);
    }

    _createClass(DemoController, [{
        key: "getByCartao",
        value: function getByCartao(req, res) {
            var cartao = req.params.cid;

            this.Guardas.findOne({ cartao: cartao, ativo: true }).select("cracha nome").exec(function (err, motorista) {
                if (err) {
                    return res.status(500).json(er);
                }

                if (!motorista) {
                    console.log("não encontrado!");
                    return res.status(404).send();
                }

                return res.json(motorista);
            });
        }
    }]);

    return DemoController;
}();

exports.default = DemoController;