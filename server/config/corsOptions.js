const allowedOrigins = ['http://localhost:3000', 'http://localhost:5173', "https://todo-app-topaz-psi.vercel.app"];
const corsOptions = {
  origin: function (origin, callback) {
    if (allowedOrigins.includes(origin) || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,         
  optionSuccessStatus: 200
};

module.exports = corsOptions 