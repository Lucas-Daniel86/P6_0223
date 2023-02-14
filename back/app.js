//Importation de 'dotenv' pour les variables d'environnement.
const dotenv = require('dotenv').config();

//Importation de 'Express'.
const express = require('express');

//Appel de Express pour créer une application.
const app = express();

//Importation middleware 'helmet'.
const helmet = require('helmet');
//Modifier les en-têtes de l'objet de réponse.
app.use(helmet({ crossOriginResourcePolicy: false, }));

//Importation middleware morgan (logger http)
const morgan = require('morgan')
//Logger les requests et les responses.
app.use(morgan('dev'));

//Importation middleware cors
const cors = require('cors');
//Permet à l'api et le client de communiquer.
app.use(cors());

//Importation du package 'path' de node.js.
const path = require('path');

//Importation du fichier sauces.js de routes.
const saucesRoutes = require('./routes/sauces');

//Importation du fichier user.js de routes.
const userRoutes = require('./routes/user');

//Importation de mongoose.
const mongoose = require('mongoose');
mongoose.set('strictQuery', false);
const password = process.env.DB_PASSWORD;
const username = process.env.DB_USER;
const cluster = process.env.DB_CLUSTER;

//Connexion de mongoDB à l'API grâce à mongoose.
const uri = `mongodb+srv://${username}:${password}@${cluster}.mongodb.net/?retryWrites=true&w=majority`
mongoose.connect((uri),
    {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(() => console.log('Connexion à MongoDB réussie !'))
    .catch(() => console.log('Connexion à MongoDB échouée !'));


//CORS.
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
});

//Fonction express.json() grâce a Express pour récupérer les requêtes
//et les afficher en format json.
app.use(express.json());


//Routes
app.use('/api/sauces', saucesRoutes);
app.use('/api/auth', userRoutes);
app.use('/images', express.static(path.join(__dirname, 'images')));

//Exportation du fichier app.js.
module.exports = app;