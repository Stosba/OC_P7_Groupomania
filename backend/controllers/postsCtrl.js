// Imports
const models = require('../models');
const asyncLib = require('async');
const jwtUtils = require('../utils/jwt.utils');

// constants
const TITLE_LIMIT = 2;
const CONTENT_LIMIT = 4;
const ITEMS_LIMIT = 50;

// Routes
  
  exports.createMessage = (req, res) => {
    // Getting auth header
    let headerAuth = req.headers['authorization'];
    let userId = jwtUtils.getUserId(headerAuth);

    // Params
    let title = req.body.title;
    let content = req.body.content;

    if (title == null || content == null) {
      return res.status(400).json({ 'error': 'missing parameters' });
    }

    if (title.length <= TITLE_LIMIT || content.length <= CONTENT_LIMIT) {
      return res.status(400).json({ 'error': 'invalid parameters' });
    }

    asyncLib.waterfall([
      function(callback) {
        models.User.findOne({
          where: { id: userId }
        })
        .then(function(userFound) {
          callback(null, userFound);
        })
        .catch(function(err) {
          return res.status(500).json({ 'error': 'unable to verify user' });
        });
      },
      function(userFound, callback) {
        if(userFound) {
          models.Message.create({
            title : title,
            content : content,
            likes : 0,
            UserId : userFound.id
          })
          .then(function(newMessage) {
            callback(newMessage);
          });
        } else {
          res.status(404).json({ 'error': 'user not found' });
        }
      },
    ], function(newMessage) {
      if (newMessage) {
        return res.status(201).json(newMessage);
      } else {
        return res.status(500).json({ 'error': 'cannot post message' });
      }
    });
  },

  exports.listMessages = (req, res) => {
    let fields = req.query.fields;
    let limit = parseInt(req.query.limit);
    let offset = parseInt(req.query.offset);
    let order = req.query.order;

    if (limit > ITEMS_LIMIT) {
      limit = ITEMS_LIMIT;
    }

    models.Message.findAll({
      order: [(order != null) ? order.split(':') : ['title', 'ASC']],
      attributes: (fields !== '*' && fields != null) ? fields.split(',') : null,
      limit: (!isNaN(limit)) ? limit : null,
      offset: (!isNaN(offset)) ? offset : null,
      include: [{
        model: models.User,
        attributes: [ 'username' ]
      }]
    }).then(function(messages) {
      if (messages) {
        res.status(200).json(messages);
      } else {
        res.status(404).json({ "error": "no messages found" });
      }
    }).catch(function(err) {
      console.log(err);
      res.status(500).json({ "error": "invalid fields" });
    });
  }