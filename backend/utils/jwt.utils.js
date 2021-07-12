const jwt = require('jsonwebtoken');

// Exported functions

const jwt_sign_secret = 'montokensupersecret'

exports.generateToken = (user) => {
  return jwt.sign({
    user_id: user.id,
    isAdmin: user.isAdmin,
  },
    jwt_sign_secret, {
    expiresIn: "48h"
  })
};

// exports.getBearer = (authorization) => { return (authorization != null) ? authorization.replace('Bearer', ' ') : null }

exports.getUserId = (data) => {
  if (data.length > 1) {
    let token = data.split(' ')[1];
    try {
      let decodedToken = jwt.verify(token, jwt_sign_secret)
      user_id = decodedToken.user_id
      return user_id
    }
    catch (err) {
      return err
    }
  };
}

// exports.generateTokenForUser = (userData) => {
//     return jwt.sign({
//       userId: userData.id,
//       isAdmin: userData.isAdmin
//     },
//     JWT_SIGN_SECRET,
//     {
//       expiresIn: '1h'
//     })
//   };
//   // parseAuthorization: function(authorization) {
//   //   return (authorization != null) ? authorization.replace('Bearer ', '') : null;
//   // },
//   exports.getUserId = (authorization) => {
//     let userId = -1;
//     let token = module.exports.parseAuthorization(authorization);
//     if(token != null) {
//       try {
//         let jwtToken = jwt.verify(token, JWT_SIGN_SECRET);
//         if(jwtToken != null)
//           userId = jwtToken.userId;
//       } catch(err) { }
//     }
//     return userId;
//   }
