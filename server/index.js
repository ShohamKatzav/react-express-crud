const express = require("express"),
  PORT = 5000,
  app = express();

const cors = require('cors');
const corsOptions = require("./config/corsOptions");
app.use(cors(corsOptions));

const mongoose = require("mongoose");
const { connectDB } = require("./config/mongodb");

const checkJwt = require("./middlewares/auth0");
const extractUser = require("./middlewares/extractUser");
app.use(checkJwt);
app.use(extractUser);


const bodyParser = require('body-parser');
app.use(bodyParser.json());

connectDB();

const todoRoutes = require("./routes/Todo");
app.use("/", todoRoutes);

app.use((err, req, res, next) => {
  if (err.name === 'UnauthorizedError') {
    console.log(err);
    return res.status(401).json({ error: 'Unauthorized' });
  }
});


mongoose.connection.once('open', () => {
  const server = app.listen(PORT, () =>
    console.log(`start listening on port : ${PORT}`));

});

module.exports = app