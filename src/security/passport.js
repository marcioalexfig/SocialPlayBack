const mongoose = require('mongoose');
const ObjectId = require('mongoose').Types.ObjectId;
const jwt = require('jsonwebtoken');
const sso = require('../config/sso-config');
const http = require("http");
//const Grid = require('gridfs-stream');
const _ = require("lodash");
     
const USER = mongoose.model('Usuario');

module.exports = function (req,res,next) {
    let item = {};
    if (req.cookies)  item = jwt.decode(req.cookies['__SOCIALACCESS__']);

    if (!item) {
        res.status(401).send({});   
        next();
    }

    let id = item.login;
    USER.findOne({ login: login }, function (err, user) {
      if (err) {
         res.status(401).send({});
         next();
      }
      if (user) {
         req.user = user;
         next();
      } else {
         res.status(401).send({});
         next();
      }
    });

 

};