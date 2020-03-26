'use strict';

var mongoose = require('mongoose');

module.exports = function (app) {
    var schema = mongoose.Schema({
        ativo: {
            type: Boolean,
            default: true
        },
        nome: {
            type: String
        },
        cartao: {
            type: String
        }
    });

    return mongoose.model("Demos", schema, 'Demos');
};