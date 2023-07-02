var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');
var Acordao = require('../controllers/acordao')
var Tribunal = require('../controllers/tribunal')
var User = require('../controllers/user')

function verificaAutenticacao(req, res, next) {
    let token = req.body.token || req.query.token
    // Apagamos o campo token porque a partir daqui já não precisamos mais dele. Para além disso, ele pode interferir no bom funcionamento das rotas GET /api/acordaos?...,
    delete req.body.token
    delete req.query.token
    if (token) {
        jwt.verify(token, "EngWeb2023", function (e, payload) {
            if (e) { // ocorreu um erro
                res.status(401).jsonp({error: e})
            } else {
                req.user = payload // mete os dados do utilizador no pedido do cliente
                next()
            }
        })
    } else {
        res.status(401).jsonp({error: 'Error: No token was provided'})
    }
}

function verificaAdmin(req, res, next) {
    let token = req.body.token || req.query.token
    // Apagamos o campo token porque a partir daqui já não precisamos mais dele. Para além disso, ele pode interferir no bom funcionamento das rotas GET /api/acordaos?...,  GET /api/querySize?...
    delete req.body.token
    delete req.query.token
    if(token){
        jwt.verify(token, "EngWeb2023", function (e, payload) {
            if (e) { // ocorreu um erro
                res.status(401).jsonp({error: e})
            } else {
                if(payload.level != 'admin'){ // não é um administrador
                    res.status(401).jsonp({error: "Only admin's have access to this feature"})
                }else{
                    next()
                }
            }
        })
    } else {
        res.status(401).jsonp({error: 'Error: No token was provided'})
    }
}

/*
Obtenção de acórdãos através de diversos parâmetros

/api/acordaos?tribunal=X
/api/acordaos?processo=X
/api/acordaos?juiz=X
/api/acordaos?data=X
/api/acordaos?keywords=X
/api/acordaos?tribunal=X&processo=X&juiz=X&data=X&keywords=X
*/
router.get('/api/acordaos', verificaAutenticacao, function (req, res, next) {
    if (Object.keys(req.query).length > 0) {
        // Tratamento de paginação
        let page = req.query.page ? parseInt(req.query.page) : 1
        let limit = req.query.limit ? parseInt(req.query.limit) : 0
        delete req.query.page
        delete req.query.limit
        // Tratamento da ordenação
        let sorting = {"Data do Acordão": -1}
        if (req.query.sort_by){
            let order = req.query.order_by == "desc" ? -1 : 1
            sorting = {[req.query.sort_by]: order}
        }
        delete req.query.sort_by
        delete req.query.order_by
        Acordao.getAcordaosByManyFields(req.query, page, limit, sorting)
            .then((result) => {
                // o result é um objecto com o formato: {'acordaos': [...], 'querySize': int}
                res.jsonp(result);
            }).catch((err) => {
                res.jsonp(err);
            });
    } else {
        let page = req.query.page ? parseInt(req.query.page) : 1
        let limit = req.query.limit ? parseInt(req.query.limit) : 0
        Acordao.list(page, limit)
        .then((result) => {
            res.jsonp(result);
        }).catch((err) => {
            res.jsonp(err);
        });
    }
})


/* Rotas relativas aos tribunais
/api/tribunais -> devolve todos os tribunais
*/
router.get('/api/tribunais', verificaAutenticacao, function (req, res, next) {
    Tribunal.list()
    .then((result) => {
        res.jsonp(result)
    }).catch((err) => {
        res.jsonp(err);
    });
})

router.get('/api/previews/:listaids', verificaAutenticacao, function (req, res, next) {
    var listaString = req.params.listaids
    var lista = JSON.parse(listaString)
    Acordao.getAcordaoPreviews(lista)
        .then((result) => {
            res.jsonp(result)
        }).catch((err) => {
            res.jsonp(err);
        });
})

router.get('/api/taxonomia', verificaAutenticacao, (req, res, next) => {
    Acordao.getTaxonomia(500)
    .then((result) => {
        res.jsonp(result)
    }).catch((err) => {
        res.jsonp(err)
    });
})

// GET /api/:id -> Obtenção de um acordão pelo id
router.get('/api/:id', verificaAutenticacao, function (req, res, next) {
    Acordao.getAcordao(req.params.id)
        .then((result) => {
            res.jsonp(result);
        }).catch((err) => {
            res.status(404).jsonp(err);
        });
})

/* Adiciona um acórdão à base de dados */
router.post('/api', verificaAdmin, function (req, res, next) {
    Acordao.addAcordao(req.body)
        .then((result) => {
            res.jsonp(result)
        }).catch((err) => {
            res.status(512).jsonp(err)
        });
})

/* Adiciona um tribunal à base de dados */
router.post('/api/tribunais', verificaAdmin, function (req, res, next) {
    Tribunal.addTribunal(req.body)
    .then((result) => {
        res.jsonp(result)
    }).catch((err) => {
        res.status(512).jsonp(err)
    });
})

/* Actualiza um acórdão da base de dados */
router.put('/api', verificaAdmin, function (req, res, next) {
    Acordao.updateAcordao(req.body)
        .then((editado) => {
            res.jsonp(editado)
        }).catch((err) => {
            res.jsonp(err)
        });
})

/* Apaga um acórdão da base de dados. */
router.delete('/api/:idAcordao', verificaAdmin, function (req, res, next) {
    let removeFromFavourites = User.removeFavouriteFromAllUsers(req.params.idAcordao)
    let removeFromHistorico = User.removeAcordaoFromHistoricoAllUsers(req.params.idAcordao)
    let deleteAcordao = Acordao.deleteAcordao(req.params.idAcordao)
    Promise.all([removeFromFavourites, removeFromHistorico, deleteAcordao])
    .then((favsResult,historicoResult,deleteResult) => {
        res.sendStatus(200)
    }).catch((err) => {
        res.status(500).jsonp(err)
    });
})


/* Verifica se um acórdão está nos favoritos de um utilizador */
router.get('/api/users/:idUser/favourite/:idAcordao', verificaAutenticacao, function (req, res, next) {
    if(req.user && (req.user._id == req.params.idUser)){ // só o próprio utilizador pode pedir informações sobre os seus favoritos.
        User.isUserFavourite(req.params.idUser, req.params.idAcordao)
        .then((result) => {
            res.jsonp(result)
        }).catch((err) => {
            res.status(500).jsonp(err)
        });
    }else{
        // ERRO 403 (Forbidden): Indica que o servidor conhece este utilizador, mas este não tem acesso a esta informação.
        res.status(403).jsonp({error: `The user ${req.user.username} is not authorized to access this information.`})
    }
})


/* Obtém os favoritos de um utilizador */
router.get('/api/users/:id/favourites', verificaAutenticacao, function (req, res, next) {
    if(req.user && (req.user._id == req.params.id)){// só o próprio utilizador pode pedir informações sobre os seus favoritos.
        User.getUserFavourites(req.params.id)
        .then((favoritos) => {
            res.jsonp(favoritos)
        }).catch((err) => {
            res.jsonp(err)
        });
    }else{
        // ERRO 403 (Forbidden): Indica que o servidor conhece este utilizador, mas este não tem acesso a esta informação.
        res.status(403).jsonp({error: `The user ${req.user.username} is not authorized to access this information.`})
    }
})

/* Adiciona um favorito a um utilizador. */
router.post('/api/users/:id/favourites', verificaAutenticacao, function (req, res, next) {
    if(req.user && (req.user._id == req.params.id)){ // só o próprio utilizador pode realizar operações nos seus favoritos.
        User.addFavouriteToUser(req.params.id, req.body.idAcordao, req.body.descricao)
        .then((result) => {
            res.jsonp(result)
        }).catch((err) => {
            res.jsonp(err)
        });
    }else{
        // ERRO 403 (Forbidden): Indica que o servidor conhece este utilizador, mas este não tem acesso a esta operação.
        res.status(403).jsonp({error: `The user ${req.user.username} is not authorized to perform this operation.`})
    }
})

/* Obtém o historico de um utilizador */
router.get('/api/users/:id/historico', verificaAutenticacao, function (req, res, next) {
    if(req.user && (req.user._id == req.params.id)){ // só o próprio utilizador pode pedir informações do seu historico.
        User.getUserHistorico(req.params.id)
        .then((historico) => {
            res.jsonp(historico)
        }).catch((err) => {
            res.jsonp(err)
        });
    }else{
        res.status(403).jsonp({error: `The user ${req.user.username} is not authorized to access this information.`})
    }
})

/* Adiciona um acórdão ao histórico de visualizações do utilizador. */
router.post('/api/users/:id/historico', verificaAutenticacao, function (req, res, next) {
    if(req.user && (req.user._id == req.params.id)){ // só o próprio utilizador pode realizar operações no seu histórico.
        User.addHistoricoToUser(req.params.id, req.body.idAcordao)
        .then((result) => {
            res.jsonp(result)
        }).catch((err) => {
            res.jsonp(err)
        });
    }else{
        // ERRO 403 (Forbidden): Indica que o servidor conhece este utilizador, mas este não tem acesso a esta operação.
        res.status(403).jsonp({error: `The user ${req.user.username} is not authorized to perform this operation.`})
    }
})

/* Edita um favorito do utilizador. */
router.put('/api/users/:id/favourites', verificaAutenticacao, function (req, res, next) {
    if(req.user && (req.user._id == req.params.id)){
        User.updateFavouriteInUser(req.params.id, req.body.idAcordao, req.body.descricao)
        .then((result) => {
            res.jsonp(result)
        }).catch((err) => {
            res.jsonp(err)
        });
    }else{
        //! ERRO 403 (Forbidden): Indica que o servidor conhece este utilizador, mas este não tem acesso a esta operação.
        res.status(403).jsonp({error: `The user ${req.user.username} is not authorized to perform this operation.`})
    }
})

/* Elimina um favorito do utilizador. */
router.delete('/api/users/:id/favourites', verificaAutenticacao, function (req, res, next) {
    if(req.user && (req.user._id == req.params.id)){
        let idAcordao = req.query.idAcordao
        if(idAcordao){
            User.removeFavouriteFromUser(req.params.id,idAcordao)
            .then((result) => {
                res.jsonp(result)
            }).catch((err) => {
                res.jsonp(err)
            })
        }else{
            res.status(400).jsonp({error: 'Esta rota necessita do argumento "idAcordao"'})
        }
    }else{
        //! ERRO 403 (Forbidden): Indica que o servidor conhece este utilizador, mas este não tem acesso a esta operação.
        res.status(403).jsonp({error: `The user ${req.user.username} is not authorized to perform this operation.`})
    }
})

module.exports = router;
