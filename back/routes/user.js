//Importation de Express.
const express = require('express');

//Appel de Express pour créer le router de chaque middleware.
const router = express.Router();

//Importation du fichier user.js de controllers.
const userCtrl = require('../controllers/user');

//Importation du middleware/Password.
const password = require('../middleware/password');

//Router POST (signup).
router.post('/signup', password, userCtrl.signup);

//Router POST (login).
router.post('/login', userCtrl.login);

//Exportation du fichier user.js de routes.
module.exports = router;