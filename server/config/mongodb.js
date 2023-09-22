const mongoose = require("mongoose");
const Todo = require("../models/Todo");
const uri = "mongodb://localhost:27017/";
const dbName = "TodoDB";

async function connectDB() {
  try {
    await mongoose.connect(uri, {
      dbName: dbName,
      useUnifiedTopology: true,
      useNewUrlParser: true
    });
    
    const collections = await mongoose.connection.db.listCollections().toArray();
    const collectionExists = collections.some((collection) => collection.name === 'todos');
    if (!collectionExists) {
      console.log("creating collection");
      await initCollection();
    }
    else
      console.log("collection exist");

  }
  catch (e) {
    console.error(e);
  }
}

async function initCollection() {
  fetch('https://dummyjson.com/todos')
    .then(async res => {
      const documentsFromDummyjson = await res.json();
      const todosArray = documentsFromDummyjson.todos.map((x) => ({ todo: x.todo, completed: x.completed }));
      const result = await Todo.insertMany(todosArray);
      console.log("Number of documents inserted: " + result.length);
    })
}

module.exports = connectDB

