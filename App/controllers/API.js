const axios = require('axios');
const env = require('../config/env')
const request = require('sync-request'); // como o axios, mas os pedidos são síncronos, isto é, o servidor "congela" até o pedido ser concluído. Não é motivo de preocupação uma vez que só fazemos um pedido deste tipo no arranque do servidor.

module.exports.getTribunaisSync = (token) => {
    return JSON.parse(request('GET', env.apiRoute(`/tribunais?token=${token}`)).getBody('utf-8'))
}

module.exports.getUserHistorico = (userID, token) => {
    return axios.get(env.apiRoute(`/users/${userID}/historico?token=${token}`))
        .then((result) => {
            return result
        }).catch((err) => {
            throw err
        });
}

module.exports.acordaosFromTribunal = (tribunal, token, numPagina) => {
    return axios.get(env.apiRoute(`/acordaos?tribunal=${tribunal}&token=${token}&page=${numPagina}&limit=10`))
        .then((result) => {
            return result
        }).catch((err) => {
            throw err
        });
}

module.exports.getUserFavourites = (userID, token) => {
    return axios.get(env.apiRoute(`/users/${userID}/favourites?token=${token}`))
        .then((result) => {
            return result
        }).catch((err) => {
            throw err
        });
}

module.exports.getAcordao = (acordaoID, token) => {
    return axios.get(env.apiRoute(`/${acordaoID}?token=${token}`))
        .then((result) => {
            return result
        }).catch((err) => {
            throw err
        });
}

module.exports.addHistoricoToUser = (userID, acordaoID, token) => {
    return axios.post(env.apiRoute(`/users/${userID}/historico?token=${token}`), { idAcordao: acordaoID })
        .then((result) => {
            return result
        }).catch((err) => {
            throw err
        });
}

module.exports.getAcordaosByManyFields = (query, numPagina, token) => {
    return axios.get(env.apiRoute(`/acordaos?token=${token}&page=${numPagina}&limit=10`), { params: query })
        .then((result) => {
            return result
        }).catch((err) => {
            throw err
        });
}

module.exports.updateAcordao = (acordaoData, token) => {
    return axios.put(env.apiRoute(`?token=${token}`), acordaoData)
        .then((result) => {
            return result
        }).catch((err) => {
            throw err
        });
}

module.exports.addAcordao = (acordaoData, token) => {
    return axios.post(env.apiRoute(`?token=${token}`), acordaoData)
        .then((result) => {
            return result
        }).catch((err) => {
            throw err.response.data
        });
}

module.exports.deleteAcordao = (acordaoID, token) => {
    return axios.delete(env.apiRoute(`/${acordaoID}?token=${token}`))
        .then((result) => {
            return result
        }).catch((err) => {
            throw err
        });
}

module.exports.getAcordaoPreviews = (acordaosIds, token) => {
    return axios.get(env.apiRoute(`/previews/${JSON.stringify(acordaosIds)}?token=${token}`))
        .then((result) => {
            return result
        }).catch((err) => {
            throw err
        });
}

module.exports.updateFavouriteInUser = (userID, favouriteData, token) => {
    return axios.put(env.apiRoute(`/users/${userID}/favourites?token=${token}`), favouriteData)
        .then((result) => {
            return result
        }).catch((err) => {
            throw err
        });
}

module.exports.removeFavouriteFromUser = (userID, acordaoID, token) => {
    return axios.delete(env.apiRoute(`/users/${userID}/favourites?idAcordao=${acordaoID}&token=${token}`))
        .then((result) => {
            return result
        }).catch((err) => {
            throw err
        });
}

module.exports.addFavouriteToUser = (userID, favouriteData, token) => {
    return axios.post(env.apiRoute(`/users/${userID}/favourites?token=${token}`), favouriteData)
        .then((result) => {
            return result
        }).catch((err) => {
            throw err
        });
}

module.exports.isUserFavourite = (userID, acordaoID, token) => {
    return axios.get(env.apiRoute(`/users/${userID}/favourite/${acordaoID}?token=${token}`))
        .then((result) => {
            return result
        }).catch((err) => {
            throw err
        });
}

module.exports.getTaxonomia = (token) => {
    return axios.get(env.apiRoute(`/taxonomia?token=${token}`))
        .then((result) => {
            return result
        }).catch((err) => {
            throw err
        });
}

module.exports.addTribunal = (tribunalData, token) => {
    return axios.post(env.apiRoute(`/tribunais?token=${token}`), tribunalData)
    .then((result) => {
        return result
    }).catch((err) => {
        throw err
    });
}