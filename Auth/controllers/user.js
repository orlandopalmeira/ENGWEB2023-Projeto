// Controlador para o modelo User
var User = require('../models/user')

module.exports.list = () => {
    return User.find().sort('name')
        .then(resposta => {
            return resposta
        })
        .catch(erro => {
            throw erro
        })
}

module.exports.getUser = id => {
    return User.findById(id)
        .then(resposta => {
            return resposta
        })
        .catch(erro => {
            throw erro
        })
}

module.exports.getUserByEmail = email => {
    return User.findOne({ email: email })
        .then((result) => {
            return result
        }).catch((err) => {
            throw err
        });
}

module.exports.addUser = u => {
    return User.create(u)
        .then(resposta => {
            return resposta
        })
        .catch(erro => {
            throw erro
        })
}


module.exports.updateUser = (id, info) => {
    return User.updateOne({ _id: id }, info)
        .then(resposta => {
            return resposta
        })
        .catch(erro => {
            throw erro
        })
}

module.exports.updateUserStatus = (id, status) => {
    return User.updateOne({ _id: id }, { active: status })
        .then(resposta => {
            return resposta
        })
        .catch(erro => {
            throw erro
        })
}

module.exports.updateUserPassword = (id, pwd) => {
    return User.updateOne({ _id: id }, pwd)
        .then(resposta => {
            return resposta
        })
        .catch(erro => {
            throw erro
        })
}

module.exports.deleteUser = id => {
    return User.deleteOne({ _id: id })
        .then(resposta => {
            return resposta
        })
        .catch(erro => {
            throw erro
        })
}

module.exports.updateUserLastAccess = id => {
    let now = new Date().toISOString().substring(0, 19)
    return User.updateOne({ _id: id }, { lastAccess: now })
        .then((result) => {
            return result
        }).catch((err) => {
            throw err
        });
}