const mongoose = require('mongoose')

var tribunalSchema = new mongoose.Schema({
    _id: String,
    name: String
},{ collection: 'tribunais' });

module.exports = mongoose.model('tribunal', tribunalSchema)