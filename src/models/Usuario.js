const mongoose = require('mongoose');
const { Schema } = mongoose;

var usuarioSchema = new Schema({
    login: String,
    email: String,
    tumblr:{
        perfil: String,
        oauth: {
            consumer_key: String,
            consumer_secret: String,
            token: String,
            token_secret: String
        }
    },
    instagram:{
        perfil: String,
        oauth: {
            consumer_key: String,
            consumer_secret: String,
            token: String,
            token_secret: String
        }
    } 
});

mongoose.model('Usuario', usuarioSchema, 'Usuario');