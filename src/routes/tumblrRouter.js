const mongoose = require('mongoose');
const ObjectId = require('mongoose').Types.ObjectId;
const jwt = require('jsonwebtoken');
const requireAuth = require('../security/passport');
const sso = require('../config/sso-config');
const http = require("http");
//const Grid = require('gridfs-stream');
const _ = require("lodash");
const moment = require('moment');
var tumblr = require('tumblr');
const passport = require('passport')
const conn = mongoose.connection;
const expressSession = require('express-session');
const TumblrStrategy = require('passport-tumblr').Strategy;
//Grid.mongo = mongoose.mongo;

//** Modelo */
const USUARIO = mongoose.model('Usuario');


// OAuth Consumer Key:   FJhTluk6W424ycOPHgdtQLoL93cQju7EaVQnTdKDkKdGD8bxSW
// Secret Key:  FeKKNOLa2Fy0uokXKZqhfvzFqeUTp11SUfF7DpO0aY61wkByGz
// https://www.tumblr.com/oauth/authorize?oauth_token=6XwY5dbSXD3ENWDY9e3iy0nm19Ux3Nhi8bXI9bQyMulHiNWm4s

//https://api.tumblr.com/console/calls/user/info
// Authenticate via OAuth
/*
var tumblr = require('tumblr.js');
var client = tumblr.createClient({
  consumer_key: 'FJhTluk6W424ycOPHgdtQLoL93cQju7EaVQnTdKDkKdGD8bxSW',
  consumer_secret: 'FeKKNOLa2Fy0uokXKZqhfvzFqeUTp11SUfF7DpO0aY61wkByGz',
  token: 'DnPuYZOi4Ma35DitVdoppkcSx9VBwu4WGaYZ7I8RVQI3w33ruf',
  token_secret: 'xeG3CRhOEEzqGmMbbrn5TnEB1rlEmNIW0vWFXo67Em4CJdirYn'
});
*/

module.exports = app => {

	var CONSUMER_KEY = "FJhTluk6W424ycOPHgdtQLoL93cQju7EaVQnTdKDkKdGD8bxSW";
	var CONSUMER_SECRET = "FeKKNOLa2Fy0uokXKZqhfvzFqeUTp11SUfF7DpO0aY61wkByGz";
	var TOKEN_SECRET = "7dxvWlMHbBZ2LKVQtMPjxbhkAvTpYEmFvPwKmGi14xcI2MeyxL";
	var PROFILE = 'mafr.tumblr.com';
	const OAUTH_TOKEN = 'OPt1f4lRAc0OsZyiF8rPRB1xLNZR9a7xrDx6VvgCCcbwItW1qD'
	var CALLBACKURL = 'https://mafr.tumblr.com/'

	passport.use(new TumblrStrategy({
		consumerKey: CONSUMER_KEY,
		consumerSecret: CONSUMER_SECRET,
		callbackURL: CALLBACKURL
	  },
	  function(toquen, secret_token, profile, done) {
		console.log(err)
		console.log(token, secret_token, profile);
		return done(null, true);
		//USUARIO.find({'social.perfil': PROFILE}, function (err, user) {
		  //return done(err, user);
		//});
	  }
	));
	//app.use(expressSession({secret: TOKEN_SECRET}));
    app.use(passport.initialize());
    app.use(passport.session());

	//app.get("/api/tumblr/videos/i/:inicio/f/:fim/p/:perfil", requireAuth, async (req, res) => {
	app.get("/api/tumblr/videos/i/:inicio/f/:fim/p/:perfil", async (req, res) => {

		//console.log(req.cookies)

		let videos = []
		let inicio, fim, perfil, social;
		inicio = req.params.inicio
		fim = req.params.fim
		perfil = req.params.perfil
		social = 'tumblr'
		let redes = await USUARIO.aggregate([
			{$project: {social: 1, _id:0}},
			{$match: {'social.type': social, 'social.perfil': perfil}}
		]);
		let network = {}
		_.forEach(redes, (rede)=>{
			_.forEach(rede.social, (r)=>{
				if (r.type==social) {
					network = r
				} 
			})	
		})

		var oauth = network.oauth;
		var blog = new tumblr.Blog(perfil, oauth);

		blog.video({limit: 100}, function(error, response) {
            if (error) {
                res.status(500).send(error);
            }
			videos = response.posts;
			res.status(200).send(videos);
        });
		
	});

	/*
	app.post("/api/solicitacoes/filter", requireAuth, async (req, res) => {
		let parametros = limparAtributos(req.body);
		let query = convObjetoEmQueryMongo(parametros);
		let solicitacoes = await SMP.find(query);
		res.send(solicitacoes);
	});
	*/

// GET /auth/tumblr
	//   Use passport.authenticate() as route middleware to authenticate the
	//   request.  The first step in Tumblr authentication will involve redirecting
	//   the user to tumblr.com.  After authorization, Tumblr will redirect the user
	//   back to this application at /auth/tumblr/callback
	app.get('/auth/tumblr', passport.authenticate('tumblr',{
		session: true,
		successReturnToOrRedirect: '/'
	  }), (req,res)=>{

	  });

	// GET /auth/tumblr/callback
	//   Use passport.authenticate() as route middleware to authenticate the
	//   request.  If authentication fails, the user will be redirected back to the
	//   login page.  Otherwise, the primary route function function will be called,
	//   which, in this example, will redirect the user to the home page.
	app.get('/auth/tumblr/callback', passport.authenticate('tumblr', { failureRedirect: '/login' }),
		function(req, res) {
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