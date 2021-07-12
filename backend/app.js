const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const helmet = require("helmet");
const cookieSession = require('cookie-session');
const nocache = require('nocache');
const rateLimit = require("express-rate-limit");
const dotenv = require("dotenv");

// import routes
const messagesRoutes = require('./routes/posts');
const userRoutes = require('./routes/users');
const likesRoutes = require('./routes/likes');
const commentsRoutes = require("./routes/comment");
dotenv.config();

//constante à utiliser avec le package rateLimit
const limiter = rateLimit({         
  windowMs: 15 * 60 * 1000,       // = 15 minutes
  max: 100
})

const app = express();

// MIDDLEWARE
// headers qui configure les actions à implémenter CORS
app.use((req, res, next) => {
    // d'accéder à notre API depuis n'importe quelle origine ( '*' ) ;
    res.setHeader('Access-Control-Allow-Origin', '*');
    // d'ajouter les headers mentionnés aux requêtes envoyées vers notre API (Origin , X-Requested-With , etc.)
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    // d'envoyer des requêtes avec les méthodes mentionnées ( GET ,POST , etc.)
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
  });

// Options pour sécuriser les cookies
const expiryDate = new Date(Date.now() + 3600000); // 1 heure (60 * 60 * 1000)
app.use(cookieSession({
  name: 'session',
  secret: process.env.SEC_SES,
  cookie: {
    secure: true,
    httpOnly: true,
    domain: 'http://localhost:3000',
    expires: expiryDate
  }
}));

// application du package rate limit
  app.use(limiter);

// limitation de la taille des fihiers
  // app.use(express.limit('100mb'));

// Helmet permet de sécuriser notre app express en paramettrant divers headers http.
  app.use(helmet());

// Désactive la mise en cache du navigateur
  app.use(nocache());

// body-parser qui permet d'extraire l'objet JSON de nos requetes post
// express.json();
// express.urlencoded()
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));

// route permettant d'afficher les images sur le frontend
  app.use('/images', express.static(path.join(__dirname, 'images')));

// importation des routes pour les utiliser
app.use('/api', messagesRoutes);
app.use('/api', commentsRoutes);
app.use('/api', userRoutes);
app.use('/api', likesRoutes);

  module.exports = app;