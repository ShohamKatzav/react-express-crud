require("dotenv").config({ path: "../.env" });

const express = require("express"),
  PORT = process.env.PORT || 5000,
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
const projectRoutes = require("./routes/Project");
app.use("/", todoRoutes);
app.use("/", projectRoutes);

// 404 handler - when no route matches
app.use((req, res) => {
  res.status(404).json({ error: 'Resource not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  if (err && err.name === 'UnauthorizedError') {
    console.error('Auth error:', err.message || err);
    return res.status(401).json({ error: 'Unauthorized' });
  }

  console.error('Unhandled error:', err && err.stack ? err.stack : err);
  const status = err && err.status && Number.isInteger(err.status) ? err.status : 500;
  const message = err && err.message ? err.message : 'Something went wrong on the server';
  res.status(status).json({ error: message });
});


mongoose.connection.once('open', () => {
  const server = app.listen(PORT, () =>
    console.log(`start listening on port : ${PORT}`));

});

module.exports = app
