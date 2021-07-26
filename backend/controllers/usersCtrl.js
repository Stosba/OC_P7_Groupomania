// Imports
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const models = require('../models');
// const asyncLib = require('async');

// routes

exports.signup = async (req, res) => {
	const email = req.body.email;
	const username = req.body.username;
	const password = req.body.password;
	const role = req.body.role;

	const email_regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	const password_regex = /^(?=.*[\d])(?=.*[A-Z])(?=.*[a-z])(?=.*[!@#$%^&*])[\w!@#$%^&*]{8,}$/;
	const username_regex = /^[A-Za-z0-9]+(?:[ _-][A-Za-z0-9]+)*$/;

	// On cherche l'utilisateur dans la db

	try {
		if (!email || !username || !password || !role) {
			throw new Error("Missing parameters");
		}

		if (!email_regex.test(email)) {
			throw new Error("Wrong email format");
		}

		if (!password_regex.test(password)) {
			throw new Error(
				"-At least 8 characters long - Include at least 1 lowercase letter - 1 capital letter - 1 number - 1 special character = !@#$%^&*"
			);
		}
		// if (username_regex.test(username)) {
		// 	throw new Error("max 20 characters");
		// }
		// if (username_regex.test(role)) {
		// 	throw new Error("max 20 characters");
		// }

		const oldUser = await models.User.findOne({
			attributes: ["email"],
			where: { email: email }
		});
		if (oldUser) {
			throw new Error("Already have an account");
		}

		const newUser = await models.User.create({
			email: email,
			username: username,
			password: await bcrypt.hash(password, 10),
			role: role,
			isAdmin: 0
		});

		if (!newUser) {
			throw new Error("Sorry,something gone wrong,please try again later");
		}

		const token = jwt.sign({ id: newUser.id }, "SECRET_KEY", { expiresIn: "2H" });

		if (!token) {
			throw new Error("Sorry,something gone wrong,please try again later");
		}

		res.status(201).json({
			user_id: newUser.id,
			email: newUser.email,
			username: newUser.username,
			isAdmin: newUser.isAdmin,
			role: newUser.role,
			token
		});
	} catch (error) {
		res.status(400).json({ error: error.message });
	}
};

exports.login = async (req, res) => {
	try {
		const user = await models.User.findOne({
			where: {
				email: req.body.email
			}
		});

		if (!user) {
			throw new Error("Sorry,can't find your account");
		}

		const isMatch = await bcrypt.compare(req.body.password, user.password);

		if (!isMatch) {
			throw new Error("Incorrect password");
		}

		const token = jwt.sign({ id: user.id }, "SECRET_KEY", { expiresIn: "2h" });
		res.status(200).json({
			user: user,
			token
		});

		if (!token) {
			throw new Error("Something gone wrong try again later");
		}
	} catch (error) {
		res.status(400).json({ error: error.message });
	}
};

exports.getUserProfile = async (req, res) => {
	try {
		const user = await models.User.findOne({
			attributes: ["id", "email", "username", "role", "isAdmin"],
			where: {
				id: req.user.id
			}
		});

		if (!user) {
			throw new Error("Sorry,can't find your account");
		}
		res.status(200).json({ user });
	} catch (error) {
		res.status(400).json({ error: error.message });
	}
};

exports.deleteUserProfile = async (req, res) => {
	try {
		const userToFind = await models.User.findOne({
			where: { id: req.user.id }
		});
		if (!userToFind) {
			throw new Error("Sorry,can't find your account");
		}
        else { 
        User.destroy({ where: {id: req.params.id} });
        }
		res.status(200).json({
			message: "Your account has been successfully deleted"
		});
	} catch (error) {
		res.status(400).json({ error: error.message });
	}
};

exports.updateUserProfile = async (req, res) => {
	try {
		const userToFind = await models.User.findOne({
			attributes: ["role", "id", "isAdmin", "username"],
			where: { id: req.user.id }
		});

		if (!userToFind) {
			throw new Error("Sorry,we can't find your account");
		}

		const userToUpdate = await models.User.update(
			{
				username: req.body.username,
				role: req.body.role,
				isAdmin: req.body.isAdmin
			},
			{
				where: { id: req.user.id }
			}
		);

		if (!userToUpdate) {
			throw new Error("Sorry,something gone wrong,please try again later");
		}
		res.status(200).json({
			user: userToUpdate.isAdmin,
			message: "Your account has been update"
		});

		if (!userToUpdate) {
			throw new Error("Sorry,we can't update your account");
		}
	} catch (error) {
		res.status(400).json({ error: error.message });
	}
};

    // exports.signup = async (req, res) => {
    //     // params
    //     let email = req.body.email;
    //     let username = req.body.username;
    //     let password = req.body.password;
    //     let bio = req.body.bio;

    //     if (email == null || username == null || password == null) {
    //         return res.status(400).json({'error': 'missing parameters'});
    //     }
    //     if (username.length >= 13 || username.length <= 4) {
    //         return res.status(400).json({'error': 'wrong username (must be length 5-12)'});
    //     }
    //     if (!EMAIL_REGEX.test(email)) {
    //         return res.status(400).json({'error': 'email is not valid'});
    //     }
    //     if (!PASSWORD_REGEX.test(password)) {
    //         return res.status(400).json({'error': 'password is not valid (must length 4 - 8 and include one number at least'});
    //     }

    //     asyncLib.waterfall([
    //         function(callback) {
    //           models.User.findOne({
    //             attributes: ['email'],
    //             where: { email: email }
    //           })
    //           .then(function(userFound) {
    //             callback(null, userFound);
    //           })
    //           .catch(function(err) {
    //             return res.status(500).json({ 'error': 'unable to verify user' });
    //           });
    //         },
    //         function(userFound, callback) {
    //           if (!userFound) {
    //             bcrypt.hash(password, 10, function( err, bcryptedPassword ) {
    //               callback(null, userFound, bcryptedPassword);
    //             });
    //           } else {
    //             return res.status(409).json({ 'error': 'user already exist' });
    //           }
    //         },
    //         function(userFound, bcryptedPassword, callback) {
    //           let newUser = models.User.create({
    //             email: email,
    //             username: username,
    //             password: bcryptedPassword,
    //             bio: bio,
    //             isAdmin: 0
    //           })
    //           .then(function(newUser) {
    //             callback(newUser);
    //           })
    //           .catch(function(err) {
    //             return res.status(500).json({ 'error': 'cannot add user' });
    //           });
    //         }
    //       ], function(newUser) {
    //         if (newUser) {
    //           return res.status(201).json({
    //             'userId': newUser.id
    //           });
    //         } else {
    //           return res.status(500).json({ 'error': 'cannot add user' });
    //         }
    //       });
    //     },

        // exports.login = (req, res) => {  
        //   // Params
        //   let email = req.body.email;
        //   let password = req.body.password;
      
        //   if (email == null ||  password == null) {
        //     return res.status(400).json({ 'error': 'missing parameters' });
        //   }
      
        //   asyncLib.waterfall([
        //     function(callback) {
        //       models.User.findOne({
        //         where: { email: email }
        //       })
        //       .then(function(userFound) {
        //         callback(null, userFound);
        //       })
        //       .catch(function(err) {
        //         return res.status(500).json({ 'error': 'unable to verify user' });
        //       });
        //     },
        //     function(userFound, callback) {
        //       if (userFound) {
        //         bcrypt.compare(password, userFound.password, function(errBycrypt, resBycrypt) {
        //           callback(null, userFound, resBycrypt);
        //         });
        //       } else {
        //         return res.status(404).json({ 'error': 'user not exist in DB' });
        //       }
        //     },
        //     function(userFound, resBycrypt, callback) {
        //       if(resBycrypt) {
        //         callback(userFound);
        //       } else {
        //         return res.status(403).json({ 'error': 'invalid password' });
        //       }
        //     }
        //   ], function(userFound) {
        //     if (userFound) {
        //       return res.status(201).json({
        //         'userId': userFound.id,
        //         'token': jwtUtils.generateTokenForUser(userFound)
        //       });
        //     } else {
        //       return res.status(500).json({ 'error': 'cannot log on user' });
        //     }
        //   });
        // },

        // exports.getUserProfile = async (req, res) => {
        //   // Getting auth header
        //   let headerAuth = req.headers['authorization'];
        //   let userId = jwtUtils.getUserId(headerAuth);
        //   let user = null;
          
        //   if (userId < 0)
        //     return res.status(400).json({ 'error': 'wrong token' });
          
        //   try {
        //      user = await models.User.findOne({
        //       attributes: [ 'id', 'email', 'username', 'bio' ],
        //       where: { id: userId }
        //     })
        //   } catch (error) {
        //     return res.status(500).json({ 'error': 'cannot fetch user' });
        //   }
        //   return res.status(201).json(user);          
        // },

        // exports.updateUserProfile = (req, res) => {
        //   // Getting auth header
        //   let headerAuth = req.headers['authorization'];
        //   let userId = jwtUtils.getUserId(headerAuth);     
        //   // Params
        //   let bio = req.body.bio;

        //   asyncLib.waterfall([
        //     function(callback) {
        //       models.User.findOne({
        //         attributes: ['id', 'bio'],
        //         where: { id: userId }
        //       }).then(function (userFound) {
        //         callback(null, userFound);
        //       })
        //       .catch(function(err) {
        //         return res.status(500).json({ 'error': 'unable to verify user' });
        //       });
        //     },
        //     function(userFound, callback) {
        //       if(userFound) {
        //         userFound.update({
        //           bio: (bio ? bio : userFound.bio)
        //         }).then(function() {
        //           callback(userFound);
        //         }).catch(function(err) {
        //           res.status(500).json({ 'error': 'cannot update user' });
        //         });
        //       } else {
        //         res.status(404).json({ 'error': 'user not found' });
        //       }
        //     },
        //   ], function(userFound) {
        //     if (userFound) {
        //       return res.status(201).json(userFound);
        //     } else {
        //       return res.status(500).json({ 'error': 'cannot update user profile' });
        //     }
        //   });
        // }    