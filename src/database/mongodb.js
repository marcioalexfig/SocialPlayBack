import mongoose from 'mongoose';
import bluebird from 'bluebird';

mongoose.Promise = bluebird;

class MongoDB {

    constructor(dbconf){
        this.uri = this.constructURI(dbconf);
        console.log("[MongoDB]", `Conectando com: ${this.uri}`);
        this.connectWithRetry();
    }

    constructURI(dbconf){
        let uri = "mongodb://";

        if(dbconf.user){
            if(dbconf.pass){
                uri += `${dbconf.user}:${dbconf.pass}@`
            }
        }

        uri += dbconf.addr;

        if(dbconf.port){
            uri += `:${dbconf.port}`;
        }

        uri += `/${dbconf.db}`;

        return uri;
    }

    connectWithRetry(){
        let self = this;
        return mongoose.connect(this.uri, {useMongoClient:true}, (err) =>{
            if(err){
                console.error("[MongoDB]", "Falha ao se conectar com o servidor mongo - tentando novamente em 5 segundos...", err);
                setTimeout(self.connectWithRetry, 5000);
            }
            console.log("[MongoDB]", "Conectado!");
        })
    }

    activateEventsListners(){
        let self = this;
        
        //Exibe erro no banco de dados e tenta reconectar
        mongoose.connection.on("error", (err) => {
            console.error('[MongoDB]', 'Erro: '+err) ;
            mongoose.disconnect();
            self.connectWithRetry();
        });

        process.on('SIGINT', () => {
            mongoose.connection.close(() => {
                console.log("[MongoDB]", "Mensagem: MongoDB desconectado pelo termino da aplicação.")
                process.exit(0);
            });
        });
    }


}

export default MongoDB;