// Imports
const models = require('../models');
const fs = require("fs");

// Routes
exports.createMessage = async (req, res) => {
  console.log(req.headers);
	try {
		const attachmentURL = `${req.protocol}://${req.get("host")}/images/${req.file.filename}`;

		if (!attachmentURL) {
			throw new Error(" Sorry, missing parameters");
		}

		// user
		const findUser = await models.User.findOne({
			attributes: ["username", "role"],
     		where: { id: req.user.id }
		});

		if (!findUser) {
			throw new Error("Sorry,we can't find your account");
		}
		// post
		const newPost = await models.Message.create({
			title: req.body.title,
			content: req.body.content,
    	  	attachment: attachmentURL,
     		likes: 0,
			UserId: req.user.id,
      		// isModerate: 0,
		});

		if (!newPost) {
			throw new Error(" Sorry, missing parameters");
		}

		res.status(200).json({ newPost });
	} catch (error) {
		res.status(400).json({ error: error.message });
	}
};

exports.listMessages = async (req, res) => {
	try {
		const fields = req.query.fields;
		const order = req.query.order;

		const posts = await models.Message.findAll({
			order: [order != null ? order.split(":") : ["createdAt", "DESC"]],
			attributes: fields != "*" && fields != null ? fields.split(",") : null,
			include: [
				{
					model: models.User,
					attributes: ["username", "isAdmin"]
				}
			]
		});
		if (!posts) {
			throw new Error(" Sorry , nothing to fetch");
		}
		res.status(200).send(posts);
	} catch (error) {
		res.status(400).json({ error: error.message });
	}
};

exports.getUserMessage = async (req, res) => {
	try {
		const order = req.query.order;
		const fields = req.query.fields;

		const postProfile = await models.Message.findAll({
			order: [order != null ? order.split(":") : ["createdAt", "DESC"]],
			attributes: fields != "*" && fields != null ? fields.split(",") : null,
			include: [
				{
					model: models.User,
					attributes: ["username"],
					where: { id: req.params.id }
				}
			]
		});
		if (!postProfile) {
			throw new Error(" This user has posted nothing ");
		}

		res.status(200).json(postProfile);
	} catch (error) {
		res.status(400).json({ error: error.message });
	}
};

exports.moderateMessage = async (req, res) => {
	try {
		const postToModerate = await models.Message.findOne({
			where: { id: req.params.id }
		});

		if (!postToModerate) {
			throw new Error(" Couldn't find your post");
		}

		const moderatedPost = (await postToModerate.isModerate)
			? postToModerate.update({
					isModerate: 0
			  })
			: postToModerate.update({
					isModerate: 1
			  });

		if (!moderatedPost) {
			throw new Error("Sorry,something gone wrong,please try again later");
		} else {
			res.status(200).json({
				message: "This post is now moderate",
				postModerate: postToModerate
			});
		}
	} catch (error) {
		res.status(400).json({ error: error.message });
	}
};

exports.deleteMessage = async (req, res) => {
	try {
		const post = await models.Message.findOne({
			where: { id: req.params.id }
		});

		// attachment
		if (post.attachment !== null) {
			const filename = post.attachment.split("/images")[1];
			fs.unlink(`images/${filename}`, error => {
				error ? console.log(error) : console.log("file has been deleted");
			});
		}

		if (!post) {
			throw new Error("Sorry,your post doesn't exist ");
		}

		// post
		const destroyedPost = await models.Message.destroy({
			where: { id: req.params.id }
		});

		if (!destroyedPost) {
			throw new Error("Sorry,something gone wrong,please try again later");
		} else {
			res.status(200).json({ message: "Post has been deleted " });
		}

		// comment
		const destroyedComment = await models.comment.destroy({
			where: { id: req.params.id }
		});

		if (!destroyedComment) {
			throw new Error("Sorry,something gone wrong,please try again later");
		} else {
			res.status(200).json({ message: "Your comment has been deleted" });
		}
	} catch (error) {
		res.status(404).json({ error: error.message });
	}
};

exports.updateMessage = async (req, res) => {
	try {
		const attachmentURL = `${req.protocol}://${req.get("host")}/images/${
			req.file.filename
		}`;

		if (!attachmentURL) {
			throw new Error("Sorry,something gone wrong , please try aagain later");
		}

		const postFound = await models.Message.findOne({
			where: { id: req.params.id }
		});

		if (!postFound) {
			throw new Error("Sorry,can't find your post");
		}

		if (postFound && postFound.UserId !== req.user.id) {
			res.status(400).json({ error: error.message });
		}

		await postFound.update({
			title: req.body.title,
			content: req.body.content,
			attachment: attachmentURL,
			userId: req.user.id
		});

		res.status(201).json({
			message: " Your post has been updated",
			PostUpdated: postFound
		});
	} catch (error) {
		res.status(400).json({ error: error.message });
	}
};

  // exports.createMessage = (req, res) => {
  //   // Getting auth header
  //   let headerAuth = req.headers['authorization'];
  //   let userId = jwtUtils.getUserId(headerAuth);

  //   // Params
  //   let title = req.body.title;
  //   let content = req.body.content;

  //   if (title == null || content == null) {
  //     return res.status(400).json({ 'error': 'missing parameters' });
  //   }

  //   if (title.length <= TITLE_LIMIT || content.length <= CONTENT_LIMIT) {
  //     return res.status(400).json({ 'error': 'invalid parameters' });
  //   }

  //   asyncLib.waterfall([
  //     function(callback) {
  //       models.User.findOne({
  //         where: { id: userId }
  //       })
  //       .then(function(userFound) {
  //         callback(null, userFound);
  //       })
  //       .catch(function(err) {
  //         return res.status(500).json({ 'error': 'unable to verify user' });
  //       });
  //     },
  //     function(userFound, callback) {
  //       if(userFound) {
  //         models.Message.create({
  //           title : title,
  //           content : content,
  //           likes : 0,
  //           UserId : userFound.id
  //         })
  //         .then(function(newMessage) {
  //           callback(newMessage);
  //         });
  //       } else {
  //         res.status(404).json({ 'error': 'user not found' });
  //       }
  //     },
  //   ], function(newMessage) {
  //     if (newMessage) {
  //       return res.status(201).json(newMessage);
  //     } else {
  //       return res.status(500).json({ 'error': 'cannot post message' });
  //     }
  //   });
  // },

  // exports.listMessages = (req, res) => {
  //   let fields = req.query.fields;
  //   let limit = parseInt(req.query.limit);
  //   let offset = parseInt(req.query.offset);
  //   let order = req.query.order;

  //   if (limit > ITEMS_LIMIT) {
  //     limit = ITEMS_LIMIT;
  //   }

  //   models.Message.findAll({
  //     order: [(order != null) ? order.split(':') : ['title', 'ASC']],
  //     attributes: (fields !== '*' && fields != null) ? fields.split(',') : null,
  //     limit: (!isNaN(limit)) ? limit : null,
  //     offset: (!isNaN(offset)) ? offset : null,
  //     include: [{
  //       model: models.User,
  //       attributes: [ 'username' ]
  //     }]
  //   }).then(function(messages) {
  //     if (messages) {
  //       res.status(200).json(messages);
  //     } else {
  //       res.status(404).json({ "error": "no messages found" });
  //     }
  //   }).catch(function(err) {
  //     console.log(err);
  //     res.status(500).json({ "error": "invalid fields" });
  //   });
  // }