const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

//Model signup de mongoDB pour enregistrer un nouvel utilisateur.
const userSchema = mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});

//Pour ne pas avoir plusieurs utilisateurs avec la même addresse mail.
userSchema.plugin(uniqueValidator);

module.exports = mongoose.model('User', userSchema);