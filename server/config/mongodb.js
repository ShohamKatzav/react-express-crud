require('dotenv').config({ path: "../.env" })
const mongoose = require("mongoose");
const Todo = require("../models/Todo");
const dbName = "TodoDB";

async function connectDB() {
  try {
    await mongoose.connect(process.env.DB_URI, {
      dbName: dbName,
      useUnifiedTopology: true,
      useNewUrlParser: true
    });

  }
  catch (e) {
    console.error(e);
  }
}

async function fetchTodos(sub) {
  const count = await Todo.find({ user_id: sub }).count();
  if (count < 150) {
    console.log("fetching...");
    try {
      const res = await fetch('https://dummyjson.com/todos');
      const documentsFromDummyjson = await res.json();
      const todosArray = documentsFromDummyjson.todos.map
        ((x) => ({ user_id: sub, todo: x.todo, completed: x.completed }));

      const result = await Todo.insertMany(todosArray);
      return result; // Return the result after insertion
    } catch (error) {
      console.error('Failed to fetch and insert todos:', error);
      throw error; // Rethrow the error for handling at a higher level if needed
    }
  }
  else {
    console.log("No more todos available");
    return null;
  }
}

module.exports = { connectDB, fetchTodos }

