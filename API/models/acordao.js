const mongoose = require('mongoose')
const ObjectId = mongoose.Types.ObjectId

var acordaoSchema = new mongoose.Schema({
    _id: ObjectId,
    tribunal: String,   
    Processo: String,
    "Data do Acordão": String,
    Descritores: [String],
    Juiz: String,
}, {strict: false}, { collection: 'acordaos' });

module.exports = mongoose.model('acordao', acordaoSchema)