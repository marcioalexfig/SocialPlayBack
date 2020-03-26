const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const requireAuth = require('../security/passport');
const sso = require('../config/sso-config');
const http = require("http");
const _ = require("lodash");

const USER = mongoose.model('Usuario');

module.exports = app => {
        app.get('/api/usuario/SSO/rid/:rid', requireAuth, async (req, res) => {
            let options = {
                "method": "GET",
                "hostname": sso.hostname,
                "port": sso.port,
                "path": "/SSO/rid/" + req.params.rid,
                "headers": {
                    "app-key": sso.appkey
                }
            };

            var request = http.request(options, function (result) {
                var chunks = [];

                result.on("data", function (chunk) {
                    chunks.push(chunk);
                });

                result.on("end", function () {
                    try {
                        var body = Buffer.concat(chunks);
                        res.json(JSON.parse(body.toString()));
                    } catch (e) {
                        res.status(404).json({ "message": "Error" + e.message });
                    };
                });
            });

            request.end();
        });

        app.get('/api/usuario/validUser', async (req, res) => {
            let item = {};
            if (req.cookies) item = jwt.decode(req.cookies['__SOCIALACCESS__']);
            if (!item) res.json({ user: "false" });
            let id = item.login;
            USER.findOne({ "login": id, "ativo": "true" }, function (err, user) {
                if (err) {
                    console.log('[ERROR]', err);
                    res.json({ user: "false" });
                }
                if (user) {
                    res.json({ user: user });
                } else {
                    res.json({ user: "false" });
                }
            });

        });

        app.post('/api/usuario/SSO/login', async (req, res) => {       
            let login = req.body.login;
            let password = req.body.password;
            let perfil = req.body.perfil;
            let social = req.body.social;
            
            console.log('LOGIN', req.body.login, req.body.password, req.body.perfil, req.body.social)

            

            if (login) {
                try {
                    
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

                    console.log('OAUTH',redes);
                    var oauth = network.oauth;
                    //let tokenAmbiente = retornaTokenAmbiente(req.headers.origin);
                    let tokenSecret = oauth.token_secret


                    if (oauth) {
                        let token = jwt.sign({ login: login }, tokenSecret);
                        res.cookie('__SOCIALACCESS__', token, { httpOnly: true })
                        return res.send();
                    } else {
                        console.log("Não encontrado no MongoDB");
                        return res.status(401).send();
                    }
                } catch (err) {
                    console.error(err);
                    return res.status(500).send();
                }

            } 
        });

        app.post('/api/usuario/SSO/logout', async (req, res) => {
            res.cookie('__SOCIALACCESS__', '', { 
                httpOnly: true, 
                expires: new Date(Date.now() - 100),
            });
            return res.status(401).send();
        });

        app.get("/api/usuario/SSO/logado", requireAuth, async (req, res) => {
            try {
                let user = req.user;
                return res.json(user);
            } catch (err) {
                console.error("[SRV-ERR]", err);
                return res.status(500).send();
            }
        });

        //applicationHml / applicationLocal / applicationPrd
        function retornaTokenAmbiente(origem){
            let t = '';
            if (origem.indexOf('hml-') > 0){
                t = app.config.applicationHml.security.tokenSecrete
            }else if (origem.indexOf('localhost') > 0){
                t = app.config.applicationLocal.security.tokenSecrete
            }else{
                t = app.config.applicationPrd.security.tokenSecrete
            }
            return t;

        }
}