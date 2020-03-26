import http from 'http';
import expressApplication from './express';
import MongoDBCli from './database/mongodb';

//const env = process.env.amb;
const env = 'local';

const config = require("./config/application.local.json")

class Main{
  constructor(){
    if(config.database.mongodb){
      new MongoDBCli(config.database.mongodb);
    }
    let app = new expressApplication(config);
    this.startServer(app);
  }

  startServer(app){
    console.log('[Servidor]', 'Iniciado na porta servidor...');
    http.createServer(app).listen(config.server.port, ()=>{
      console.log('[Servidor]', 'Iniciado na porta '+ config.server.port);
    });
  }
}

(new Main());