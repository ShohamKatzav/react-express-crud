const express = require("express"),
  PORT = 5000,
  app = express();

const {db, closeMongoClient} = require('./mongodb')


app.get("/api/v1/todos", async (req, res) => {
  try {
    const todos = await db.collection('todocollection').find().toArray();
    console.log(todos);
    res.send(todos);
  } catch (err) {
    console.error('Failed to retrieve todos:', err);
    res.status(500).send('Internal Server Error');
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
