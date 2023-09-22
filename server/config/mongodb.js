const mongoose = require("mongoose");
const Todo = require("../models/Todo");
const uri = "mongodb://localhost:27017/";

async function connectDB() {

  try {
    const connection = await mongoose.connect(uri, {
      useUnifiedTopology: true,
      useNewUrlParser: true
    });
    const db = connection.connection.db;
    var collectionExists = (await db.listCollections().toArray()).filter(x => x.name === "todos");
    if (collectionExists == false) {
      {
        console.log("creating collection");
        const collection = db.collection('todos');
        await initCollection(collection);
      }
    }
    else
      console.log("collection exist");

  }
  catch (e) {
    console.error(e);
  }
}

async function initCollection(collection) {
  fetch('https://dummyjson.com/todos')
    .then(async res => {
      const documentsFromDummyjson = await res.json();
      const todoValues = documentsFromDummyjson.todos.map(x => new Todo({ todo: x.todo, completed: x.completed }));
      const result = await collection.insertMany(todoValues);
      console.log("Number of documents inserted: " + result.insertedCount);
    })
}

module.exports = connectDB

