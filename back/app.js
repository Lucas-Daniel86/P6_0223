const dotenv = require('dotenv').config();

const express = require('express');

const app = express();

const path = require('path');

const saucesRoutes = require('./routes/sauces');
const userRoutes = require('./routes/user');

const cors = require('cors');
app.use(cors());

const mongoose = require('mongoose');
mongoose.set('strictQuery', false);
const password = process.env.DB_PASSWORD;
const username = process.env.DB_USER;
const uri = `mongodb+srv://${username}:${password}@cluster0.8dvdry8.mongodb.net/?retryWrites=true&w=majority`
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