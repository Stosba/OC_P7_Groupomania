// Imports
const models = require('../models');
const jwtUtils = require('../utils/jwt.utils');
const asyncLib = require('async');

// Constants
const DISLIKED = 0;
const LIKED = 1;

// Routes

exports.likePost = async (req, res) => {
  try {
     // Getting auth header
     let headerAuth = req.headers['authorization'];
     let userId = jwtUtils.getUserId(headerAuth);
 
     // Params
     let messageId = parseInt(req.params.messageId);
 
     if (messageId <= 0) {
       throw new Error('invalid parameters');
     }

     const message = await models.Message.findOne({
      where: { id: messageId }
      // where: {id: req.body.id}
    });
    if (!message) {
			throw new Error("Sorry,we can't find message");
    }
    
    const user = await models.User.findOne({
      where: { id: userId } 
    });
    if (!user) {
			throw new Error("Sorry,we can't find user");
    }

    const like = await models.Like.findOne({
      where: {
        userId: userId,
        messageId: messageId
      }
    });

  } catch {

  }
};

  exports.likePost = (req, res) => {
    // Getting auth header
    let headerAuth = req.headers['authorization'];
    let userId = jwtUtils.getUserId(headerAuth);

    // Params
    let messageId = parseInt(req.params.messageId);

    if (messageId <= 0) {
      return res.status(400).json({ 'error': 'invalid parameters' });
    }

    asyncLib.waterfall([
      function(callback) {
        models.Message.findOne({
          where: { id: messageId }
          // where: {id: req.body.id}
        })
        .then(function(messageFound) {
          callback(null, messageFound);
        })
        .catch(function(err) {
          return res.status(500).json({ 'error': 'unable to verify message' });
        });
      },
      function(messageFound, callback) {
        if(messageFound) {
          models.User.findOne({
            where: { id: userId }
            // where: {id: req.user.id}
          })
          .then(function(userFound) {
            callback(null, messageFound, userFound);
          })
          .catch(function(err) {
            return res.status(500).json({ 'error': 'unable to verify user' });
          });
        } else {
          res.status(404).json({ 'error': 'post already liked' });
        }
      },
      function(messageFound, userFound, callback) {
        if(userFound) {
          models.Like.findOne({
            where: {
              userId: userId,
              messageId: messageId
            }
          })
          .then(function(userAlreadyLikedFound) {
            callback(null, messageFound, userFound, userAlreadyLikedFound);
          })
          .catch(function(err) {
            return res.status(500).json({ 'error': 'unable to verify if user already liked' });
          });
        } else {
          res.status(404).json({ 'error': 'user not exist' });
        }
      },
      function(messageFound, userFound, userAlreadyLikedFound, callback) {
        if(!userAlreadyLikedFound) {
          messageFound.addUser(userFound, { isLike: LIKED })
          .then(function (alreadyLikeFound) {
            callback(null, messageFound, userFound);
          })
          .catch(function(err) {
            return res.status(500).json({ 'error': 'unable to set user reaction' });
          });
        } else {
          if (userAlreadyLikedFound.isLike === DISLIKED) {
            userAlreadyLikedFound.update({
              isLike: LIKED,
            }).then(function() {
              callback(null, messageFound, userFound);
            }).catch(function(err) {
              res.status(500).json({ 'error': 'cannot update user reaction' });
            });
          } else {
            res.status(409).json({ 'error': 'message already liked' });
          }
        }
      },
      function(messageFound, userFound, callback) {
        messageFound.update({
          likes: messageFound.likes + 1,
        }).then(function() {
          callback(messageFound);
        }).catch(function(err) {
          res.status(500).json({ 'error': 'cannot update message like counter' });
        });
      },
    ], function(messageFound) {
      if (messageFound) {
        return res.status(201).json(messageFound);
      } else {
        return res.status(500).json({ 'error': 'cannot update message' });
      }
    });
  },

  exports.dislikePost = (req, res) => {
   // Getting auth header
   let headerAuth = req.headers['authorization'];
   let userId = jwtUtils.getUserId(headerAuth);

   // Params
   let messageId = parseInt(req.params.messageId);

   if (messageId <= 0) {
     return res.status(400).json({ 'error': 'invalid parameters' });
   }

   asyncLib.waterfall([
    function(callback) {
       models.Message.findOne({
         where: { id: messageId }
       })
       .then(function(messageFound) {
         callback(null, messageFound);
       })
       .catch(function(err) {
         return res.status(500).json({ 'error': 'unable to verify message' });
       });
     },
     function(messageFound, callback) {
       if(messageFound) {
         models.User.findOne({
          //  where: { id: userId }
           where: {id: req.user.id}
         })
         .then(function(userFound) {
           callback(null, messageFound, userFound);
         })
         .catch(function(err) {
           return res.status(500).json({ 'error': 'unable to verify user' });
         });
       } else {
         res.status(404).json({ 'error': 'post already liked' });
       }
     },
     function(messageFound, userFound, callback) {
       if(userFound) {
         models.Like.findOne({
           where: {
             userId: userId,
             messageId: messageId
           }
         })
         .then(function(userAlreadyLikedFound) {
            callback(null, messageFound, userFound, userAlreadyLikedFound);
         })
         .catch(function(err) {
           return res.status(500).json({ 'error': 'unable to verify if user already liked' });
         });
       } else {
         res.status(404).json({ 'error': 'user not exist' });
       }
     },
     function(messageFound, userFound, userAlreadyLikedFound, callback) {
      if(!userAlreadyLikedFound) {
        messageFound.addUser(userFound, { isLike: DISLIKED })
        .then(function (alreadyLikeFound) {
          callback(null, messageFound, userFound);
        })
        .catch(function(err) {
          return res.status(500).json({ 'error': 'unable to set user reaction' });
        });
      } else {
        if (userAlreadyLikedFound.isLike === LIKED) {
          userAlreadyLikedFound.update({
            isLike: DISLIKED,
          }).then(function() {
            callback(null, messageFound, userFound);
          }).catch(function(err) {
            res.status(500).json({ 'error': 'cannot update user reaction' });
          });
        } else {
          res.status(409).json({ 'error': 'message already disliked' });
        }
      }
     },
     function(messageFound, userFound, callback) {
       messageFound.update({
         likes: messageFound.likes - 1,
       }).then(function() {
         callback(messageFound);
       }).catch(function(err) {
         res.status(500).json({ 'error': 'cannot update message like counter' });
       });
     },
   ], function(messageFound) {
     if (messageFound) {
       return res.status(201).json(messageFound);
     } else {
       return res.status(500).json({ 'error': 'cannot update message' });
     }
   });
  }