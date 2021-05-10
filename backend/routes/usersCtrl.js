// Imports
const bcrypt = require('bcrypt');
const jwtUtils = require('../utils/jwt.utils');
const models = require('../models');
const asyncLib = require('async');

// Regex
const EMAIL_REGEX = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const PASSWORD_REGEX = /^(?=.*\d).{4,8}$/;

// routes
module.exports = {

    signup: function(req, res) {
        // params
        let email = req.body.email;
        let username = req.body.username;
        let password = req.body.password;
        let bio = req.body.bio;
        
        if (email == null || username == null || password == null) {
            return res.status(400).json({'error': 'missing parameters'});
        }
        if (username.length >= 13 || username.length <= 4) {
            return res.status(400).json({'error': 'wrong username (must be length 5-12)'});
        }
        if (!EMAIL_REGEX.test(email)) {
            return res.status(400).json({'error': 'email is not valid'});
        }
        if (!PASSWORD_REGEX.test(password)) {
            return res.status(400).json({'error': 'password is not valid (must length 4 - 8 and include one number at least'});
        }

        asyncLib.waterfall([
            function(callback) {
              models.User.findOne({
                attributes: ['email'],
                where: { email: email }
              })
              .then(function(userFound) {
                callback(null, userFound);
              })
              .catch(function(err) {
                return res.status(500).json({ 'error': 'unable to verify user' });
              });
            },
            function(userFound, callback) {
              if (!userFound) {
                bcrypt.hash(password, 10, function( err, bcryptedPassword ) {
                  callback(null, userFound, bcryptedPassword);
                });
              } else {
                return res.status(409).json({ 'error': 'user already exist' });
              }
            },
            function(userFound, bcryptedPassword, callback) {
              let newUser = models.User.create({
                email: email,
                username: username,
                password: bcryptedPassword,
                bio: bio,
                isAdmin: 0
              })
              .then(function(newUser) {
                callback(newUser);
              })
              .catch(function(err) {
                return res.status(500).json({ 'error': 'cannot add user' });
              });
            }
          ], function(newUser) {
            if (newUser) {
              return res.status(201).json({
                'userId': newUser.id
              });
            } else {
              return res.status(500).json({ 'error': 'cannot add user' });
            }
          });
        },

        login: function(req, res) {  
          // Params
          let email = req.body.email;
          let password = req.body.password;
      
          if (email == null ||  password == null) {
            return res.status(400).json({ 'error': 'missing parameters' });
          }
      
          asyncLib.waterfall([
            function(callback) {
              models.User.findOne({
                where: { email: email }
              })
              .then(function(userFound) {
                callback(null, userFound);
              })
              .catch(function(err) {
                return res.status(500).json({ 'error': 'unable to verify user' });
              });
            },
            function(userFound, callback) {
              if (userFound) {
                bcrypt.compare(password, userFound.password, function(errBycrypt, resBycrypt) {
                  callback(null, userFound, resBycrypt);
                });
              } else {
                return res.status(404).json({ 'error': 'user not exist in DB' });
              }
            },
            function(userFound, resBycrypt, callback) {
              if(resBycrypt) {
                callback(userFound);
              } else {
                return res.status(403).json({ 'error': 'invalid password' });
              }
            }
          ], function(userFound) {
            if (userFound) {
              return res.status(201).json({
                'userId': userFound.id,
                'token': jwtUtils.generateTokenForUser(userFound)
              });
            } else {
              return res.status(500).json({ 'error': 'cannot log on user' });
            }
          });
        },

        getUserProfile: function(req, res) {
          // Getting auth header
          let headerAuth = req.headers['authorization'];
          let userId = jwtUtils.getUserId(headerAuth);
      
          if (userId < 0)
            return res.status(400).json({ 'error': 'wrong token' });
      
          models.User.findOne({
            attributes: [ 'id', 'email', 'username', 'bio' ],
            where: { id: userId }
          }).then(function(user) {
            if (user) {
              res.status(201).json(user);
            } else {
              res.status(404).json({ 'error': 'user not found' });
            }
          }).catch(function(err) {
            res.status(500).json({ 'error': 'cannot fetch user' });
          });
        },

        updateUserProfile: function(req, res) {
          // Getting auth header
          let headerAuth = req.headers['authorization'];
          let userId = jwtUtils.getUserId(headerAuth);     
          // Params
          let bio = req.body.bio;
      
          asyncLib.waterfall([
            function(callback) {
              models.User.findOne({
                attributes: ['id', 'bio'],
                where: { id: userId }
              }).then(function (userFound) {
                callback(null, userFound);
              })
              .catch(function(err) {
                return res.status(500).json({ 'error': 'unable to verify user' });
              });
            },
            function(userFound, callback) {
              if(userFound) {
                userFound.update({
                  bio: (bio ? bio : userFound.bio)
                }).then(function() {
                  callback(userFound);
                }).catch(function(err) {
                  res.status(500).json({ 'error': 'cannot update user' });
                });
              } else {
                res.status(404).json({ 'error': 'user not found' });
              }
            },
          ], function(userFound) {
            if (userFound) {
              return res.status(201).json(userFound);
            } else {
              return res.status(500).json({ 'error': 'cannot update user profile' });
            }
          });
        }
      }