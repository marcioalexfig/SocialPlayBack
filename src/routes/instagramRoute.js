const mongoose = require('mongoose');
const ObjectId = require('mongoose').Types.ObjectId;
const jwt = require('jsonwebtoken');
const requireAuth = require('../security/passport');
const sso = require('../config/sso-config');
const http = require("http");
//const Grid = require('gridfs-stream');
const _ = require("lodash");
const moment = require('moment');
const passport = require('passport')
const conn = mongoose.connection;
const expressSession = require('express-session');
const InstagramStrategy = require('passport-instagram').Strategy;
//Grid.mongo = mongoose.mongo;

//** Modelo */
const USUARIO = mongoose.model('Usuario');

/*
//https://www.instagram.com/developer/clients/manage/?registered=SocialPlay
// Create a new instance.
//https://www.instagram.com/developer/authentication/
//https://www.instagram.com/oauth/authorize/?client_id=fb169e09762246d3a850fbe58269f1a2&redirect_uri=http://matec.mobi&response_type=code

 const instagram = new Instagram({
            clientId: 'fb169e09762246d3a850fbe58269f1a2',
            clientSecret: 'bcb887d69c8142c580d5e6682203b946',
            accessToken: geraAccessToken(),
          });
        instagram.get('users/self', (err, data) => {
            console.log(data);
            
            if(err){
                console.log(err)
                
            }
		});
		
*/

module.exports = app => {
	
	//app.use(passport.initialize());
	//app.use(passport.session());
	var CONSUMER_KEY = "fb169e09762246d3a850fbe58269f1a2";
	var CONSUMER_SECRET = "4aead23811074e4ab656ae46db88eea6";
	var CALLBACKURL = require('querystring').stringify('http://localhost:10080/auth/instagram/callback')
 
    // Passport needs to be able to serialize and deserialize users to support persistent login sessions
    passport.serializeUser(function(user, done) {
        console.log('serializing user: ');console.log(user);
        done(null, user._id);
    });

    passport.deserializeUser(function(id, done) {
        USUARIO.findById(id, function(err, user) {
            console.log('deserializing user:',user);
            done(err, user);
        });
	});
	
	passport.use(new InstagramStrategy({
		clientID: CONSUMER_KEY,
		clientSecret: CONSUMER_SECRET,
		callbackURL: CALLBACKURL
	  },
	  function(accessToken, refreshToken, profile, done) {
		  process.nextTick(function() {
			  // find the user in the database based on their facebook id
			  console.log(err)
			  console.log(accessToken, refreshToken, profile);
			})
		/*
		User.findOrCreate({ instagramId: profile.id }, function (err, user) {
		  return done(err, user);
		});
		*/
		}
	));
	//app.use(expressSession({secret: TOKEN_SECRET}));

	

// GET /auth/tumblr
	//   Use passport.authenticate() as route middleware to authenticate the
	//   request.  The first step in Tumblr authentication will involve redirecting
	//   the user to tumblr.com.  After authorization, Tumblr will redirect the user
	//   back to this application at /auth/tumblr/callback
	app.get('/auth/instagram', passport.authenticate('instagram'),function(req, res) {
		console.log('AQUI NO CALLBACK')
		console.log(res)
		res.redirect('/');
	});

	app.get('/auth/instagram/callback', passport.authenticate('instagram', { failureRedirect: '/login' }),
	function(req, res) {
		// Successful authentication, redirect home.
		console.log('AQUI')
		console.log(res)
		//res.redirect('/');
	});
	app.get('/auth/instagram/retorno',
	function(req, res) {
		// Successful authentication, redirect home.
		console.log('AQUI')
		
		res.redirect('/');
	});

	app.get('/logout', function(req, res){
		req.logout();
		res.redirect('/');
	});

	//app.listen(3000);


	// Simple route middleware to ensure user is authenticated.
	//   Use this route middleware on any resource that needs to be protected.  If
	//   the request is authenticated (typically via a persistent login session),
	//   the request will proceed.  Otherwise, the user will be redirected to the
	//   login page.
	function ensureAuthenticated(req, res, next) {
	if (req.isAuthenticated()) { return next(); }
	res.redirect('/login')
	}
	
	
}