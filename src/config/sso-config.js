
module.exports = 
        {
        "hostname": process.env['process.env.HOST_SSO'],
        "port": process.env['process.env.PORT_SSO'],
        "appkey": 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        "validate": function () {
                let host = process.env['process.env.HOST_SSO'];
                let port = process.env['process.env.PORT_SSO'];
                if (!host || !port) throw new Error("Configuração de acesso ao SSO indefinida");
                console.log(`Comunicacao com SSO host => ${host}:${port}`);
        }
        
};