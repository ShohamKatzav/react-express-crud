const express = require("express"),
  PORT = 5000,
  app = express();

const bodyParser = require('body-parser');
app.use(bodyParser.json());

const mongodb = require('mongodb');
const {db, closeMongoClient} = require('./mongodb')


app.get("/api/v1/todos", async (req, res) => {
  try {
    const todos = await db.collection('todocollection').find().toArray();
    res.send(todos);
  } catch (err) {
    console.error('Failed to retrieve todos:', err);
    res.status(500).send('Internal Server Error');
  }
});

app.post("/api/v1/todos", async (req, res) => {
  const newDoc = {todo: req.body.value}
  await db.collection('todocollection').insertOne(newDoc, function (err) {
    if (err) {
      console.error('Failed to insert document:', err);
      return;
    }
  });
  res.send(newDoc);
});

app.delete("/api/v1/todos", async (req, res) => {
  const query = {_id: new mongodb.ObjectId(req.body.id)};
  await db.collection('todocollection').deleteOne(query, async function (err) {
    if (err) {
      console.error('Failed to delete document:', err);
      return;
    }
  });
  res.sendStatus(204);
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
