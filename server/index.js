const express = require("express"),
  PORT = 5000,
  app = express();

const cors = require('cors');
const allowedOrigins = ['http://localhost:3000', 'http://localhost:5173', 'https://todo-5rfj0t2o2-shohamkatzavs-projects.vercel.app', "https://todo-app-topaz-psi.vercel.app"];
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
app.use(cors(corsOptions));

const mongoose = require("mongoose");
const { connectDB, fetchTodos } = require("./config/mongodb");
const Todo = require("./models/Todo");

const checkJwt = require("./middlewares/auth0");
const extractUser = require("./middlewares/extractUser");
const guard = require("express-jwt-permissions")();

const bodyParser = require('body-parser');
app.use(bodyParser.json());

connectDB();

app.use(checkJwt);
app.use(extractUser);

app.post("/api/v1/fetchTodos", guard.check(['create:todos']), async (req, res) => {
  try {
    const todos = await fetchTodos(req.user.sub, parseInt(req.body.fetchAmount));
    todos.length ? res.send(todos) : res.sendStatus(204);
  } catch (err) {
    console.error('Failed to retrieve todos:', err);
    res.sendStatus(500);
  }
});

app.delete("/api/v1/cleanList", guard.check(['delete:todos']), async (req, res) => {
  try {
    await Todo.deleteMany({ user_id: req.user.sub });
    res.sendStatus(204);
  }
  catch (err) {
    console.error('Failed to delete document:', err);
    res.sendStatus(500);
  }
});

app.get("/api/v1/todos", guard.check(['read:todos']), async (req, res) => {
  try {
    const todos = await Todo.find({ user_id: req.user.sub }).exec();
    res.send(todos);
  } catch (err) {
    console.error('Failed to retrieve todos:', err);
    res.sendStatus(500);
  }
});

app.post("/api/v1/todos", guard.check(['create:todos']), async (req, res) => {
  try {
    const count = await Todo.find({ user_id: req.user.sub }).count();
    if (count < 150) {
      const newDoc = await Todo.create({ user_id: req.user.sub, todo: req.body.value, completed: req.body.completed });
      res.send(newDoc);
    }
    else
      res.sendStatus(204)
  } catch (err) {
    console.error('Failed to insert document:', err);
    res.sendStatus(500);
  }
});

app.delete("/api/v1/todos", guard.check(['delete:todos']), async (req, res) => {
  try {
    await Todo.findByIdAndRemove(req.body.id);
    res.sendStatus(204);
  }
  catch (err) {
    console.error('Failed to delete document:', err);
    res.sendStatus(500);
  }
});

app.put("/api/v1/editText", guard.check(['update:todos']), async (req, res) => {
  try {
    const updatedDoc = await Todo.findByIdAndUpdate(req.body.id, { todo: req.body.todo }, { returnDocument: "after" });
    res.send(updatedDoc);
  }
  catch (err) {
    console.error('Failed to update complete for document:', err);
    res.sendStatus(500);
  }
});

app.put("/api/v1/editStatus", guard.check(['update:todos']), async (req, res) => {
  try {
    const updatedDoc = await Todo.findByIdAndUpdate(req.body.id, { completed: req.body.completed }, { returnDocument: "after" });
    res.send(updatedDoc);
  }
  catch (err) {
    console.error('Failed to update complete for document:', err);
    res.sendStatus(500);
  }
});

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