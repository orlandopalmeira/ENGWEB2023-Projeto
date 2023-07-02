const user = require('../models/user');
const User = require('../models/user')

const maxLimitHistorico = 10 //* Numero máximo de acordaos que se armazenam para cada user

module.exports.list = () => {
    return User.find()
        .then((result) => {
            return result
        }).catch((err) => {
            throw err
        });
}

module.exports.getUser = (id) => {
    return User.findOne({ _id: id })
        .then((result) => {
            return result
        }).catch((err) => {
            throw err
        });
}

module.exports.getUserFavourites = (id) => {
    return User.findOne({ _id: id })
        .then((user) => {
            return user.favourites
        }).catch((err) => {
            throw err
        });
}

module.exports.isUserFavourite = (idUser, idAcordao) => {
    return User.findOne({ _id: idUser })
        .then((user) => {
            favoritosArr = user.favourites.map(e => e.idAcordao)
            if (favoritosArr.includes(idAcordao)){
                return true
            }
            else return false
        }).catch((err) => {
            throw err
        });
}

module.exports.addFavouriteToUser = (idUser, idAcordao, descricaoFavorito) => {
    let value = { 'idAcordao': idAcordao, descricao: descricaoFavorito }
    return User.updateOne({ _id: idUser },
        {
            $push: {
                favourites: {
                    $each: [value],
                    $position: 0
                }
            }
        })
        .then((result) => {
            return result
        }).catch((err) => {
            throw err
        });
}

module.exports.removeFavouriteFromUser = (idUser, idAcordao) => {
    return User.updateOne({ _id: idUser }, {
        $pull: { favourites: { 'idAcordao': idAcordao } }
    }).then((result) => {
        return result
    }).catch((err) => {
        throw err
    });
}

//* https://sparkbyexamples.com/mongodb/update-objects-in-the-array-in-mongodb/
module.exports.updateFavouriteInUser = (idUser, idAcordao, novaDescricao) => {
    return User.updateOne({ _id: idUser, 'favourites.idAcordao': idAcordao }, {
        $set: { 'favourites.$.descricao': novaDescricao }
    }).then((result) => {
        return result
    }).catch((err) => {
        throw err
    });
}


//* Ações relativas ao historico
module.exports.getUserHistorico = (id) => {
    return User.findOne({ _id: id })
        .then((acordao) => {
            return acordao.historico
        }).catch((err) => {
            throw err
        });
}

// Adiciona um id de acordão à lista dos visitados
module.exports.addHistoricoToUser = (idUser, idAcordao) => {
    return User.findOne({ _id: idUser })
        .then((user) => {
            let hist = user.historico
            const index = hist.indexOf(idAcordao)
            if (index > -1) hist.splice(index, 1)
            hist.unshift(idAcordao)
            hist = hist.slice(0, maxLimitHistorico) // Limita o armazenamento do historico
            return User.updateOne(
                { _id: idUser },
                { $set: { historico: hist } }
            )
                .then((result) => {
                    return result
                }).catch((err) => {
                    throw err
                });
        }).catch((err) => {
            throw err
        });
}

module.exports.removeFavouriteFromAllUsers = (idAcordao) => {
    return User.updateMany(
        {},
        { $pull: { favourites: { idAcordao: idAcordao } } }
    ).then((result) => {
        return result
    }).catch((err) => {
        throw err
    });
}

module.exports.removeAcordaoFromHistoricoAllUsers = (idAcordao) => {
    return User.updateMany(
        {},
        { $pull: { historico: idAcordao } }
    ).then((result) => {
        return result
    }).catch((err) => {
        throw err
    });
}
