//Importation de jsonwebtoken
const jwt = require('jsonwebtoken');

//Importation de dotenv pour les variables d'environnement.
const dotenv = require('dotenv').config();

module.exports = (req, res, next) => {
    try {

        //'split' pour prendre uniquement la chaîne du TOKEN.
        const token = req.headers.authorization.split(' ')[1];
        const decodedToken = jwt.verify(token, `${process.env.JWT_KEY_TOKEN}`);

        //Récupérer l'userId du TOKEN.
        const userId = decodedToken.userId;

        //Autorisation de la requête uniquement si l'userId existe
        //dans la requête et si ça correspond.
        if (req.body.userId && req.body.userId !== userId) {
            throw 'Erreur identification userId'
        }
        else {
            next();
        }
    } catch (error) {
        res.status(401).json({
            message: "Échec d'authentification",
            error: error
        });
    }
};