const _ = require("lodash");
const xvideos = require('@rodrigogs/xvideos');
module.exports = app => {
	app.get("/api/xvideo/videos/i/:inicio/f/:fim/p/:perfil", (req, res) => {
		let videos = [];
		let inicio = req.params.inicio
		let fim = req.params.fim
		console.log("aguarde...")
		xvideos.videos.fresh({ page: 1 }).then((fresh)=>{
			let cont = 0;
			fresh.videos.slice(inicio, fim).forEach( (element) => {
				xvideos.videos.details(element).then(function (obj){
					videos.push({"video_url":obj.files.high});
					//console.log(obj.files.high);
					//console.log("CONTADOR:"+cont, " VIDEOS.LENGTH-1:"+(videos.length-1));
					cont++;
					if(parseInt(cont) == parseInt(fim - inicio)){
						res.status(200).send(videos);
					}
				})
			})
		})
	});
}