// Imports
const models = require('../models');
const jwtUtils = require('../utils/jwt.utils');

// Routes

exports.likePost = (req, res, next) => {
  const likeObject = req.body;
    Like.findAll({where: {
      articleId: req.body.articleId,
      userId: req.body.userId
      }})
      .then(likes => {
        if(likes.length === 0) {
          const like = new Like({
            ...likeObject
          });
          // Enregistrement de l'objet like dans la base de données
          like.save()
          .then(() => {
            Like.findAll({
              where: {messageId: req.body.articleId}
            }).then(likes => {
              res.status(200).json({ like: likes.length});
            })
          })
          .catch(error => res.status(400).json({ error }));
        } else {
          Like.destroy({ where: {
            articleId: req.body.articleId,
            userId: req.body.userId }})
            .then(() => {
              Like.findAll({
                where: {articleId: req.body.articleId}
              }).then(likes => {
                res.status(200).json({ like: likes.length});
              })
            })
            .catch(error => res.status(400).json({ error }));
        }
      }
    )
}