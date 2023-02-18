const dotenv = require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan')
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');

const saucesRoutes = require('./routes/sauces');
const userRoutes = require('./routes/user');

const app = express();

//Modifier les en-têtes de l'objet de réponse.
app.use(helmet({ crossOriginResourcePolicy: false, }));

//Logger les requêtes et les réponses.
app.use(morgan('dev'));

//Améliorer la communication entre l'API et le client.
app.use(cors());

mongoose.set('strictQuery', false);
const password = process.env.DB_PASSWORD;
const username = process.env.DB_USER;
const cluster = process.env.DB_CLUSTER;

//Connexion mongoDB à l'API grâce à mongoose.
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

//Récupérer les requêtes et les afficher en format json.
app.use(express.json());

//Routes
app.use('/api/sauces', saucesRoutes);
app.use('/api/auth', userRoutes);
app.use('/images', express.static(path.join(__dirname, 'images')));

//Exportation du fichier.
module.exports = app;