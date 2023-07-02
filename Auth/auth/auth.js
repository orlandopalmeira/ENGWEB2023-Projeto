var jwt = require('jsonwebtoken')

module.exports.verificaAcesso = function (req, res, next) {
	var myToken = req.query.token || req.body.token
	if (myToken) {
		jwt.verify(myToken, "EngWeb2023", function (e, payload) {
			if (e) {
				res.status(401).jsonp({ error: e })
			}
			else {
				req.idUser = payload._id
				req.isAdmin = payload.level === 'admin'
				next()
			}
		})
	}
	else {
		res.status(401).jsonp({ error: "Token inexistente!" })
	}
}

module.exports.verificaAdmin = function (req, res, next) {
	var myToken = req.query.token || req.body.token
	if (myToken) {
		jwt.verify(myToken, "EngWeb2023", function (e, payload) {
			if (e) {
				res.status(401).jsonp({ error: e })
			}
			else {
				if(payload.level === 'admin'){
					next()
				}else{
					res.status(403).jsonp({error: 'Apenas administradores têm acesso a esta operação.'})
				}
			}
		})
	}
	else {
		res.status(401).jsonp({ error: "Token inexistente!" })
	}
}
