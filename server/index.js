const express = require("express"),
  PORT = 5000,
  app = express();

const bodyParser = require('body-parser');
app.use(bodyParser.json());

const { ObjectId, db, closeMongoClient } = require('./mongodb')


app.get("/api/v1/todos", async (req, res) => {
  try {
    const todos = await db.collection('todocollection').find().toArray();
    res.send(todos);
  } catch (err) {
    console.error('Failed to retrieve todos:', err);
    res.sendStatus(500);
  }
});

app.post("/api/v1/todos", async (req, res) => {
  const newDoc = { todo: req.body.value, completed: req.body.completed }
  try {
    await db.collection('todocollection').insertOne(newDoc);
    res.send(newDoc);
  } catch (err) {
    console.error('Failed to insert document:', err);
    res.sendStatus(500);
  }
});

app.delete("/api/v1/todos", async (req, res) => {
  const query = { _id: new ObjectId(req.body.id) };
  try {
    await db.collection('todocollection').deleteOne(query);
    res.sendStatus(204);
  }
  catch (err) {
    console.error('Failed to delete document:', err);
    res.sendStatus(500);
  }
});

app.put("/api/v1/editTodo", async (req, res) => {
  const query = { _id: new ObjectId(req.body.id) };
  var params;
  if (req.body.changesType == "completed")
    params = { $set: { "completed": req.body.completed } };
  else if (req.body.changesType == "todo")
    params = { $set: { "todo": req.body.todo } };
  try {
    const updatedDoc = await db.collection('todocollection').findOneAndUpdate(
      query,
      params,
      { returnDocument: "after" });
    res.send(updatedDoc);
  }
  catch (err) {
    console.error('Failed to update complete for document:', err);
    res.sendStatus(500);
  }
});


const server = app.listen(PORT, () =>
  console.log(`start listening on port : ${PORT}`));

process.on('SIGINT', () => {
  server.close(() => {
    closeMongoClient().then(() => {
      process.exit(0);
    }).catch(err => {
      process.exit(1);
    });
  });
});
