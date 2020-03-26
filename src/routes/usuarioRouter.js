const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const requireAuth = require('../security/passport');
const sso = require('../config/sso-config');
const http = require("http");
const _ = require("lodash");
const moment = require('moment');

const USER = mongoose.model('Usuario');

module.exports = app => {

	app.get('/api/usuarios', requireAuth, async (req, res) => {
		let users = await USER.find({});
		res.send(users);
	});

	app.get('/api/usuario/id/:id', requireAuth, async (req, res) => {
		let user = await USER.findOne({ "rid": req.params.id });
		res.send(user);
	});

//app.get("/api/usuario/:login", requireAuth, async (req, res) => {
	app.get("/api/usuario/login/:login", async (req, res) => {
		try {
			let login = req.params.login
			let usuario = await USER.find({login: login});
			return res.status(200).send(usuario);
		} catch (err) {
			console.error("[SRV-ERR]", err);
			return res.status(500).send();
		}
	});

	//TODO - requireAuth
	app.get("/api/usuario/social/:social/perfil/:perfil", async (req, res) => {
		try {
			let perfil = req.params.perfil
			let social = req.params.social
			let redes = await USER.aggregate([
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
			return res.status(200).send(network);
		} catch (err) {
			console.error("[SRV-ERR]", err);
			return res.status(500).send();
		}
	});

//app.post('/api/usuario/save', requireAuth, async (req, res) => {
	app.post('/api/usuario/save', async (req, res) => {
		let usuario = new USER(req.body);
		/*let usuario = new USER({
			login:'alex',
			nome:'Marcio Alex',
			tumblr:{
				perfil:'mafr.tumblr.com',
				oauth: {
					consumer_key: 'FJhTluk6W424ycOPHgdtQLoL93cQju7EaVQnTdKDkKdGD8bxSW',
					consumer_secret: 'FeKKNOLa2Fy0uokXKZqhfvzFqeUTp11SUfF7DpO0aY61wkByGz',
					token: 'wxnSJkC5qGvCuvIqLLbUsRRACdhqYdR6V1k0o6vYiYpO6USms1',
					token_secret: 'Fy99hEYX7AuKbRCLByCSH4nTizw59jIgiwCgIRN46fYv3ZcBGE'
				  }
			}
		});*/
		let control = (usuario._id) ? 'EDITAR' : 'NOVO';
		USER.findOneAndUpdate(
			{ "_id": usuario._id }, usuario,
			{ upsert: true, new: true, runValidators: true },
			function (err, doc) {
				if (err) {
					console.log(err);
					res.status(500).send({ "message": "Internal error.", "sysmsg": err });
				} else {
					res.status(200).send({ "message": "Usuário " + (control == 'NOVO' ? "criado." : "editado.") });
				}
			}
		);
	});


}