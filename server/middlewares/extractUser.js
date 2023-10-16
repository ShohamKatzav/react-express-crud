const extractUser = (req, res, next) => {
    const user = req.auth; // Replace with the actual property containing user information
    req.user = user;
  
    next();
  };
  
  module.exports = extractUser;