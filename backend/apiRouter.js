// Imports
const express = require('express');
const usersCtrl = require('./routes/usersCtrl');
const messagesCtrl = require('./routes/messagesCtrl');
const likesCtrl    = require('./routes/likesCtrl');

// Router
exports.router = (function() {
  const apiRouter = express.Router();

  // Users routes
  apiRouter.route('/users/signup/').post(usersCtrl.signup);
  apiRouter.route('/users/login/').post(usersCtrl.login);
  apiRouter.route('/users/me/').get(usersCtrl.getUserProfile);
  apiRouter.route('/users/me/').put(usersCtrl.updateUserProfile);

//   // Messages routes
  apiRouter.route('/messages/new/').post(messagesCtrl.createMessage);
  apiRouter.route('/messages/').get(messagesCtrl.listMessages);

  // Likes
  apiRouter.route('/messages/:messageId/vote/like').post(likesCtrl.likePost);
  apiRouter.route('/messages/:messageId/vote/dislike').post(likesCtrl.dislikePost);

  return apiRouter;
})();