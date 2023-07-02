const axios = require('axios');
const env = require('../config/env')
const request = require('sync-request'); // como o axios, mas os pedidos são síncronos, isto é, o servidor "congela" até o pedido ser concluído. Não é motivo de preocupação uma vez que só fazemos um pedido deste tipo no arranque do servidor.
var jwt = require('jsonwebtoken');

module.exports.genServerTokenSync = () => {
    const admin = { email: 'admin@tribunais.gov.pt', password: 'admin' }
    return JSON.parse(request('POST', env.authRoute('/login'), { json: admin }).getBody('utf-8')).token;
}

module.exports.verificaAutenticacao = (req, res, next) => {
    let token = req.cookies.token
    if (token) {
        jwt.verify(token, "EngWeb2023", function (e, payload) {
            if (e) { // ocorreu um erro
                res.redirect('/login')
            }
            else {
                req.idUser = payload._id
                req.isAdmin = (payload.level == 'admin') // verifica se o token é referente a um utilizador que é administrador
                next()
            }
        })
    } else {
        req.session.redirectTo = req.originalUrl
        res.redirect('/login')
    }
}

module.exports.verificaAdmin = (req, res, next) => {
    let token = req.cookies.token
    if (token) {
        jwt.verify(token, "EngWeb2023", function (e, payload) {
            if (e) { // ocorreu um erro
                res.redirect('/login')
            } else {
                req.idUser = payload._id
                req.isAdmin = (payload.level == 'admin')
                if (req.isAdmin)
                    next()
                else
                    res.redirect('/login')
            }
        })
    } else {
        req.session.redirectTo = req.originalUrl
        res.redirect('/login')
    }
}

module.exports.login = (loginData) => {
    return axios.post(env.authRoute('/login'), loginData)
        .then((result) => {
            return result // token do authserver
        }).catch((err) => {
            throw err
        });
}

module.exports.register = (signupData) => {
    return axios.post(env.authRoute('/register'), signupData)
        .then((result) => {
            return result
        }).catch((err) => {
            throw err
        });
}

module.exports.registerAdmin = (newAdminData, token) => {
    return axios.post(env.authRoute(`/registerAdmin?token=${token}`), newAdminData)
        .then((result) => {
            return result
        }).catch((err) => {
            throw err
        });
}

module.exports.getUser = (userID, token) => {
    return axios.get(env.authRoute(`/${userID}?token=${token}`))
        .then((result) => {
            return result
        }).catch((err) => {
            throw err
        });
}

module.exports.updateUser = (userID, userData, token) => {
    return axios.put(env.authRoute(`/${userID}?token=${token}`), userData)
        .then((result) => {
            return result
        }).catch((err) => {
            throw err
        });
}

