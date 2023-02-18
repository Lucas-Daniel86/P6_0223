const express = require('express');

const router = express.Router();

const userCtrl = require('../controllers/user');

const password = require('../middleware/password');

//Router POST (signup).
router.post('/signup', password, userCtrl.signup);

//Router POST (login).
router.post('/login', userCtrl.login);

//Exportation du fichier.
module.exports = router;