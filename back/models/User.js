//Importation de mongoose.
const mongoose = require('mongoose');

//Importation de uniqueValidator.
const uniqueValidator = require('mongoose-unique-validator');

//Model signup de mongoDB pour enregistrer un nouvel utilisateur.
const userSchema = mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});

//Pour ne pas avoir plusieurs utilisateurs avec la même addresse mail.
//Application de la méthode 'plugin' pour contrôler le mail.
userSchema.plugin(uniqueValidator);

//Exportation du userSchema.
module.exports = mongoose.model('User', userSchema);