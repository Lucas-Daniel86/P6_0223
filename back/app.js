const dotenv = require('dotenv').config();

const express = require('express');

const app = express();

//Importation middleware helmet
const helmet = require('helmet');
//Modifier les en-têtes de l'objet de réponse
app.use(helmet({ crossOriginResourcePolicy: false, }));

//Importation middleware morgan (logger http)
const morgan = require('morgan')
//Logger les requests et les responses
app.use(morgan('dev'));

//Importation middleware cors
const cors = require('cors');
//Permet à l'api et le client de communiquer
app.use(cors());

const path = require('path');


const saucesRoutes = require('./routes/sauces');
const userRoutes = require('./routes/user');

const mongoose = require('mongoose');
mongoose.set('strictQuery', false);
const password = process.env.DB_PASSWORD;
const username = process.env.DB_USER;
const cluster = process.env.DB_CLUSTER;

const uri = `mongodb+srv://${username}:${password}@${cluster}.mongodb.net/?retryWrites=true&w=majority`
mongoose.connect((uri),
    {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(() => console.log('Connexion à MongoDB réussie !'))
    .catch(() => console.log('Connexion à MongoDB échouée !'));

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
});

app.use(express.json());

app.use('/api/sauces', saucesRoutes);
app.use('/api/auth', userRoutes);
app.use('/images', express.static(path.join(__dirname, 'images')));

module.exports = app;