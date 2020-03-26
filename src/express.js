import express, { Router } from 'express';
import expressLoad from 'express-load';
import cookieParser from 'cookie-parser';
import fileUpload from 'express-fileupload';
import morgan from 'morgan';
import helmet from 'helmet';
import fs from 'fs';
import rfs from 'rotating-file-stream';
import path from 'path';
import cors from 'cors';
import bodyParser from 'body-parser';

// Initialize Passport
//import initPassport from './security/passport';
import util from'util'

const sso = require('./config/sso-config');

class Express {

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
    constructor(conf) {
        console.log("[Express]", "Iniciando Framework")
        this.app = express();

        this.configurations = conf;
    
        this.setCors();
        this.setLogging();
        this.setPublicPath();
        this.basicLoad();
        this.setSSO();

        return this.app;
    }

    /**
     * Configura o diretório public com base no arquivo de configurção
     * O diretório estatico será definido na propiedade 'server.staticPath'
     * caso esta estiver definida como false o diretório estático será 
     * definido como: './public'
     */
    setPublicPath() {
        this.app.use(express.static(this.configurations.server.staticPath ? this.configurations.server.staticPath : "./public"));
    }
    /**
     * Carrega as diretivas e middlewares basicos do express
     */
    basicLoad() {
        //Carrega configuração para dentro da aplicação
        this.app.set('config', this.configurations);
        
        //Interpreta cookie e injeta na requisição
        this.app.use(cookieParser());

        //Interpreta body params e injeta na requisição
        this.app.use(bodyParser.json());
        this.app.use(bodyParser.urlencoded({ extended: true }));

        //Recebe arquivos e injeta na requisição
        //this.app.use(fileUpload());

        // Carrega os diretórios base da aplicação
        expressLoad('models', { cwd: 'src' }) //Diretório de Modelos de dados (Modelo MongoDB com biblioteca Mongoose)
            .then('controllers') //Diretório de controladores da aplicação
            .then('tools') //Diretório de extras de ferramentas para a aplicação
            .then('routes') //Diretório de documentos de rotas
            .then('config')
            .into(this.app);
    }

    /**
     * Define os parâmetros de segurança da aplicação via HelmetJS
     */
    setSecurity() {
        let self = this;

        //Iniciao o HelmetJS
        this.app.use(helmet());

        //Desabilita os cabeçalhos listados na configuração
        this.configurations.security.disabledHeader.forEach((e) => {
            self.app.disable(e);
        });

        //Modifica o PoweredBy para a string desejada
        if (this.configurations.security.hidePoweredBy) {
            this.app.use(helmet.hidePoweredBy(this.configurations.security.hidePoweredBy));
        }

        //Bloqueia tentativas de XSS
        if (this.configurations.security.blockXSS) {
            this.app.use(helmet.xssFilter())
        }

        //Bloqueia tentativas de Sniff
        if (this.configurations.security.nosniff) {
            this.app.use(helmet.noSniff());
        }
    }

    /**
     * Define o nivel de log e se o log vai ser na tela ou em arquivo
     */
    setLogging() {
        if (this.configurations.server.logging.file) {
            let logDir = path.join(__dirname, '..', 'log');
            fs.existsSync(logDir) || fs.mkdirSync(logDir);

            let accessLogStream = rfs('access.log', {
                interval: '1d',
                path: logDir
            });

            this.app.use(morgan(this.configurations.server.logging.level, {
                stream: accessLogStream
            }));
        } else {
            this.app.use(morgan(this.configurations.server.logging.level));
        }
    }

    /**
     * Responde filtro cors
     */
    setCors() {
        //Iniciao o cors
        this.app.use(cors());
       
        this.app.use(function (req, res, next) {

            res.header("Access-Control-Allow-Methods", "POST, GET, PUT, DELETE, OPTIONS");
            res.header("Access-Control-Allow-Origin", "http://localhost:3000");
            res.header("Access-Control-Allow-Credentials", "false");
            res.header("Access-Control-Expose-Headers", "X-Request-Width, Content-Type, X-Codingpedia, Credentials, Origin");
            res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Headers, Authorization");
            
            if(req.method === "OPTIONS") return res.status(204).send();

            next();
        });
    }

    setSSO() {
        //sso.validate();
    }
}

export default Express;