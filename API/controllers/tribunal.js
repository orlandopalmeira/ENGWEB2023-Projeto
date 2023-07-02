const Tribunal = require('../models/tribunal')

// Devolve todos os tribunais (id + nome)
module.exports.list = () => {
    return Tribunal.find()
            .then((result) => {
                let aux = {}
                result.forEach(obj => {aux[obj._id] = obj.name})
                return aux
            }).catch((err) => {
                throw err
            });
}

// Devolve o nome de um tribunal (nome)
module.exports.getTribunalName = (id) => {
    return Tribunal.findOne({_id: id})
            .then((result) => {
                return {name: result.name}
            }).catch((err) => {
                throw err
            });
}

// Adiciona um tribunal
module.exports.addTribunal = (trib) => {
    return Tribunal.collection.insertOne(trib)
            .then((result) => {
                return result
            }).catch((err) => {
                throw err
            });
}

// Remove um tribunal
module.exports.deleteTribunal = (id) => {
    return Tribunal.deleteOne({_id: id})
            .then((result) => {
                return result
            }).catch((err) => {
                throw err
            });

}