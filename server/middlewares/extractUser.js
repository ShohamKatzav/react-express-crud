const extractUser = (req, res, next) => {
    // Assuming req.auth contains user information, you can extract it like this
    const user = req.auth; // Replace with the actual property containing user information
  
    // Store the user information in a request property for later use
    req.user = user;
  
    // Call the next middleware in the chain
    next();
  };
  
  module.exports = extractUser;