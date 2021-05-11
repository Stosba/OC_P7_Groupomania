const jwt = require('jsonwebtoken');

const JWT_SIGN_SECRET = '<JWT_SIGN_TOKEN>';

// Exported functions
exports.generateTokenForUser = (userData) => {
    return jwt.sign({
      userId: userData.id,
      isAdmin: userData.isAdmin
    },
    JWT_SIGN_SECRET,
    {
      expiresIn: '1h'
    })
  },
  // parseAuthorization: function(authorization) {
  //   return (authorization != null) ? authorization.replace('Bearer ', '') : null;
  // },
  
  exports.getUserId = (authorization) => {
    let userId = -1;
    let token = module.exports.parseAuthorization(authorization);
    if(token != null) {
      try {
        let jwtToken = jwt.verify(token, JWT_SIGN_SECRET);
        if(jwtToken != null)
          userId = jwtToken.userId;
      } catch(err) { }
    }
    return userId;
  }
