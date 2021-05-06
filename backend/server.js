// Serveur Groupomania

const express = require('express');
const bodyParser = require('body-parser');
const apiRouter = require('./apiRouter').router;

// Instantiate server
var server = express();

// Body Parser configuration
server.use(bodyParser.urlencoded({ extended: true }));
server.use(bodyParser.json());

// Configure routes
server.get('/', function (req, res) {
    res.setHeader('Content-Type', 'text/html');
    res.status(200).send('<h1>Bonjour sur mon super server</h1>');
});

server.use('/api/', apiRouter);

// Launch server
server.listen(3000, function() {
    console.log('Server en écoute sur le port 3000');
});