const mongoose = require('mongoose')
const ObjectId = mongoose.Types.ObjectId
const Schema = mongoose.Schema

var favouriteSchema = new Schema({
    idAcordao: String,
    descricao: String
})

var userSchema = new Schema({
    _id: ObjectId,
    name: String,
    username: String,
    email: String,
    favourites: [favouriteSchema],
    historico: [String],
    dateCreated: String,
    lastAccess: String,
},{ collection: 'users' });

module.exports = mongoose.model('user', userSchema)