//Importation de bcrypt pour hasher le password.
const bcrypt = require('bcrypt');

//https://www.youtube.com/watch?v=YSzKHcNJ_Rs

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
            //Données à enregistrer sur mongoDB.
            const user = new User({
                email: req.body.email,
                password: hash,
            });

            //Enregistrement sur mongoDB
            user.save()
                .then(() => res.status(201).json({ message: 'Utilisateur créé !' }))
                .catch(error => res.status(400).json({ error }));
        })
        .catch(error => res.status(500).json({ error }));
};

//Logique POST (login) pour contrôler la validité de l'utilisateur
exports.login = (req, res, next) => {

    User.findOne({ email: req.body.email })
        .then((user) => {
            if (!user) {
                return res.status(401).json({ error: 'Utilisateur non trouvé !' });
            }

            //L'utilisateur existe.
            //La méthode compare() de bcrypt, compare le mdp envoyé par 'utilisateur,
            //avec le hash enregistré avec l'user dans mongoDB.
            bcrypt.compare(req.body.password, user.password)
                .then(valid => {
                    if (!valid) {
                        return res.status(401).json({ error: 'Mot de passe incorrect !' });
                    }
                    else {
                        res.status(200).json({
                            userId: user._id,
                            token: jwt.sign(
                                { userId: user._id },
                                //clé de chiffrement du TOKEN.
                                `${process.env.JWT_KEY_TOKEN}`,
                                { expiresIn: '24h' }
                            )
                        });
                    }
                })
                .catch(error => res.status(500).json({ error }));
        })
        .catch(error => res.status(500).json({ error }));
};