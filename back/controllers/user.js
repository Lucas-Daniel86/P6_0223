//Importation de bcrypt pour hasher le password.
const bcrypt = require('bcrypt');

//Importation de dotenv pour les variables d'environnement.
const dotenv = require('dotenv').config();

//Importation de jsonwebtoken
const jwt = require('jsonwebtoken');

//Importation du model 'User'.
const User = require('../models/User');

//Logique POST pour créer un nouvel utilisateur (signup).
exports.signup = (req, res, next) => {
    //Hasher le mot de passe, saler 10x l'algorithme d'hashage
    bcrypt.hash(req.body.password, 10)
        .then((hash) => {
            //Données à enregistrer dans mongoDB.
            const user = new User({
                email: req.body.email,
                password: hash
            });
            //Enregistrement dans mongoDB.
            user.save()
                .then(() => res.status(201).json({ message: 'Utilisateur créé !' }))
                .catch(error => res.status(400).json({ error }));
        })
        .catch(error => res.status(500).json({ error }));
};

//Logique POST pour contrôler la validité de l'utilisateur (login).
exports.login = (req, res, next) => {

    User.findOne({ email: req.body.email })
        .then((user) => {
            if (!user) {
                //Message volontairement flou pour éviter la fuite de données.
                return res.status(401).json({ message: 'Paire identifiant/mot de passe incorrecte' });
            } else {
                //L'utilisateur existe.
                bcrypt.compare(req.body.password, user.password)
                    .then(valid => {
                        if (!valid) {
                            return res.status(401).json({ message: 'Paire identifiant/mot de passe incorrecte' });
                        } else {
                            res.status(200).json({
                                userId: user._id,
                                token: jwt.sign(
                                    { userId: user._id },
                                    //Clé de chiffrement du TOKEN.
                                    `${process.env.JWT_KEY_TOKEN}`,
                                    { expiresIn: '24h' }
                                )
                            });
                        }
                    })
                    .catch(error => res.status(500).json({ error }));
            }
        })
        .catch(error => res.status(500).json({ error }));
};