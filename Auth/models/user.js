const mongoose = require('mongoose')
const ObjectId = mongoose.Types.ObjectId
var passportLocalMongoose = require('passport-local-mongoose');

var userSchema = new mongoose.Schema({
    username: String,
    password: String,
    email: String,
    name: String,
    level: String,
    dateCreated: String,
    lastAccess: String
}, { collection: 'users' });

userSchema.plugin(passportLocalMongoose, {usernameField: 'email'});

module.exports = mongoose.model('user', userSchema)