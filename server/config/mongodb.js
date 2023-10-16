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

// We'll skip a random number to get different todos every call
// skip will be from 0 to (150-amount-1)
async function fetchTodos(sub, amount) {
  const TOTAL = 150;
  const skip = Math.floor(Math.random() * (TOTAL - amount));
  const count = await Todo.find({ user_id: sub }).count();
  if (count + amount <= 150) {
    try {
      const res = await fetch(`https://dummyjson.com/todos?limit=${amount}&skip=${skip}`);
      const documentsFromDummyjson = await res.json();
      const todosArray = documentsFromDummyjson.todos.map
        ((x) => ({ user_id: sub, todo: x.todo, completed: x.completed }));

      const result = await Todo.insertMany(todosArray);
      return result;
    } catch (error) {
      console.error('Failed to fetch and insert todos:', error);
      throw error;
    }
  }
  else {
    return [];
  }
}

module.exports = { connectDB, fetchTodos }

