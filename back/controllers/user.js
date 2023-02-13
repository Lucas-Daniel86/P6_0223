//Importation de bcrypt pour hasher le password 
const bcrypt = require('bcrypt');

//Importation de crypto-js pour chiffrer le mail
//https://www.youtube.com/watch?v=YSzKHcNJ_Rs
const cryptojs = require('crypto-js');

//Importation de dotenv pour les variables d'environnement
const dotenv = require('dotenv').config();

//Importation de jsonwebtoken
const jwt = require('jsonwebtoken');

//Importation de models de la base de donnée User.js
const User = require('../models/User');

exports.signup = (req, res, next) => {

    //Chiffrer l'email dans la base de donnée
    const emailCryptoJS = cryptojs.HmacSHA256(req.body.email, `${process.env.CRYPTOJS_EMAIL}`).toString();

    //Hasher le mot de passe, saler 10x l'algorithme d'hashage
    bcrypt.hash(req.body.password, 10)
        .then(hash => {
            //Enregistrement sur mongoDB
            const user = new User({
                email: emailCryptoJS,
                password: hash
            });
            user.save()
                .then(() => res.status(201).json({ message: 'Utilisateur créé !' }))
                .catch(error => res.status(400).json({ error }));
        })
        .catch(error => res.status(500).json({ error }));
};

exports.login = (req, res, next) => {

    //Chiffrer l'email dans la base de donnée s'il existe
    const emailCryptoJS = cryptojs.HmacSHA256(req.body.email, `${process.env.CRYPTOJS_EMAIL}`).toString();

    User.findOne({ email: emailCryptoJS })
        .then(user => {
            if (!user) {
                return res.status(401).json({ error: 'Utilisateur non trouvé !' });
            }
            bcrypt.compare(req.body.password, user.password)
                .then(valid => {
                    if (!valid) {
                        return res.status(401).json({ error: 'Mot de passe incorrect !' });
                    }
                    res.status(200).json({
                        userId: user._id,
                        token: jwt.sign(
                            { userId: user._id },
                            `${process.env.JWT_KEY_TOKEN}`,
                            { expiresIn: '24h' }
                        )
                    });
                })
                .catch(error => res.status(500).json({ error }));
        })
        .catch(error => res.status(500).json({ error }));
};