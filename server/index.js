const express = require("express"),
  PORT = 5000,
  app = express();

const bodyParser = require('body-parser');
app.use(bodyParser.json());

const mongoose = require("mongoose");
const connectDB = require("./config/mongodb");
const Todo = require("./models/Todo");

connectDB();

app.get("/api/v1/todos", async (req, res) => {
  try {
    const todos = await Todo.find().exec();
    res.send(todos);
  } catch (err) {
    console.error('Failed to retrieve todos:', err);
    res.sendStatus(500);
  }
});

app.post("/api/v1/todos", async (req, res) => {
  try {
    const newDoc = await Todo.create({todo: req.body.value, completed: req.body.completed });
    res.send(newDoc);
  } catch (err) {
    console.error('Failed to insert document:', err);
    res.sendStatus(500);
  }
});

app.delete("/api/v1/todos", async (req, res) => {
  try {
    await Todo.findByIdAndRemove(req.body.id);
    res.sendStatus(204);
  }
  catch (err) {
    console.error('Failed to delete document:', err);
    res.sendStatus(500);
  }
});

app.put("/api/v1/editText", async (req, res) => {
  try {
    const updatedDoc = await Todo.findByIdAndUpdate(req.body.id, { todo: req.body.todo }, { returnDocument: "after" });
    res.send(updatedDoc);
  }
  catch (err) {
    console.error('Failed to update complete for document:', err);
    res.sendStatus(500);
  }
});

app.put("/api/v1/editStatus", async (req, res) => {
  try {
    const updatedDoc = await Todo.findByIdAndUpdate(req.body.id, { completed: req.body.completed }, { returnDocument: "after" });
    res.send(updatedDoc);
  }
  catch (err) {
    console.error('Failed to update complete for document:', err);
    res.sendStatus(500);
  }
});


mongoose.connection.once('open', () => {
  const server = app.listen(PORT, () =>
  console.log(`start listening on port : ${PORT}`));

});
