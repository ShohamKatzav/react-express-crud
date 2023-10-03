const { expressjwt: jwt } = require("express-jwt");
const jwksRsa = require('jwks-rsa');


require('dotenv').config({path: "../.env"})

// Middleware to validate JWT tokens using Auth0
const checkJwt = jwt({
    // Your Auth0 domain and audience
    secret: jwksRsa.expressJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: `https://${process.env.VITE_APP_AUTH0_DOMAIN}/.well-known/jwks.json`,
    }),
    audience: process.env.VITE_APP_AUTH0_API_AUDIENCE,
    issuer: process.env.VITE_APP_AUTH0_API_ISSUER,
    algorithms: ['RS256'],
});


module.exports = checkJwt