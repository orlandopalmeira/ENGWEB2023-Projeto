var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken')
var passport = require('passport')
var userModel = require('../models/user')
var auth = require('../auth/auth')

var User = require('../controllers/user')

router.get('/', auth.verificaAcesso, function (req, res) {
    if (req.query) {
        if (req.query.email) {
            User.getUserByEmail(req.query.email)
                .then((result) => {
                    if(req.idUser == result._id)
                        res.status(200).jsonp({ dados: result })
                    else
                        res.status(403).jsonp({error: `[AUTH] The user ${req.user.username} is not authorized to access this information.`})
                }).catch((err) => {
                    res.status(500).jsonp({ error: err })
                });
        } else {
            res.status(400).jsonp({ error: '[AUTH]: A rota /users?... tem de ter o parâmetro "email"' })
        }
    } else {
        User.list()
            .then(dados => res.status(200).jsonp({ dados: dados }))
            .catch(e => res.status(500).jsonp({ error: e }))
    }
})

router.get('/:id', auth.verificaAcesso, function (req, res) {
    if(req.params.id === req.idUser){
        User.getUser(req.params.id)
            .then(dados => res.status(200).jsonp({ dados: dados }))
            .catch(e => res.status(500).jsonp({ error: e }))
    }else
        res.status(403).jsonp({error: `[AUTH] The user ${req.user.username} is not authorized to access this information.`})
})

router.post('/register', function (req, res) {
    var d = new Date().toISOString()
    userModel.register(new userModel({
            username: req.body.username, name: req.body.name, email: req.body.email,
            level: "normal", dateCreated: d.substring(0, 10), lastAccess: d.substring(0, 19)
        }),
        req.body.password,
        function (err, user) {
            if (err)
                res.jsonp({ error: err})
            else {
                passport.authenticate("local")(req, res, () => {
                    jwt.sign({
                            _id: req.user._id, email: req.user.email, level: req.user.level
                        },
                        "EngWeb2023",
                        { expiresIn: 3600 },
                        function (e, token) {
                            if (e) res.status(500).jsonp({ error: "Erro na geração do token: " + e })
                            else res.status(201).jsonp({ token: token })
                        }
                    );
                })
            }
        }
    )
})

router.post('/registerAdmin', auth.verificaAdmin,  function (req, res) {
    var d = new Date().toISOString()
    userModel.register(new userModel({
            username: req.body.username, name: req.body.name, email: req.body.email,
            level: "admin", dateCreated: d.substring(0, 10), lastAccess: d.substring(0, 19)
        }),
        req.body.password,
        function (err, user) {
            if (err)
                res.jsonp({ error: err})
            else {
                res.sendStatus(200)
            }
        }
    )
})

router.post('/login', passport.authenticate('local'), function (req, res) {
    jwt.sign({
            _id: req.user._id, email: req.user.email, level: req.user.level
        },
        "EngWeb2023",
        { expiresIn: 3600 }, // 1 hora
        function (e, token) {
            if (e) res.status(500).jsonp({ error: "Erro na geração do token: " + e })
            else {
                User.updateUserLastAccess(req.user._id)
                res.status(201).jsonp({ token: token })
            }
        }
    );
})

router.put('/:id', auth.verificaAcesso, function (req, res) {
    if(req.idUser === req.params.id){
        User.updateUser(req.params.id, req.body)
            .then(dados => {
                res.jsonp(dados)
            })
            .catch(erro => {
                res.status(409).jsonp({ error: erro }) // Conflict ( emails )
            })
    }else
        res.status(403).jsonp({error: `[AUTH] The user ${req.user.username} is not authorized to perform this operation.`})
})

router.delete('/:id', auth.verificaAcesso, function (req, res) {
    User.deleteUser(req.params.id)
        .then(dados => {
            res.jsonp(dados)
        })
        .catch(erro => {
            res.status(500).jsonp(erro)
        })
})

module.exports = router;