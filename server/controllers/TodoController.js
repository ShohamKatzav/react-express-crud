const { fetchTodos } = require("../config/mongodb");
const Todo = require("../models/Todo");

const FetchTodos = async (req, res) => {
    try {
        const todos = await fetchTodos(req.user.sub, parseInt(req.body.fetchAmount));
        todos.length ? res.send(todos) : res.sendStatus(204);
    } catch (err) {
        console.error('Failed to retrieve todos:', err);
        res.sendStatus(500);
    }
};

const CleanList = async (req, res) => {
    try {
        await Todo.deleteMany({ user_id: req.user.sub });
        res.sendStatus(204);
    }
    catch (err) {
        console.error('Failed to delete document:', err);
        res.sendStatus(500);
    }
};

const GetTodos = async (req, res) => {
    try {
        const todos = await Todo.find({ user_id: req.user.sub }).exec();
        res.send(todos);
    } catch (err) {
        console.error('Failed to retrieve todos:', err);
        res.sendStatus(500);
    }
};

const CreateTodo = async (req, res) => {
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
};

const DeleteTodo = async (req, res) => {
    try {
        await Todo.findByIdAndRemove(req.body.id);
        res.sendStatus(204);
    }
    catch (err) {
        console.error('Failed to delete document:', err);
        res.sendStatus(500);
    }
};

const EditText = async (req, res) => {
    try {
        const updatedDoc = await Todo.findByIdAndUpdate(req.body.id, { todo: req.body.todo }, { returnDocument: "after" });
        res.send(updatedDoc);
    }
    catch (err) {
        console.error('Failed to update complete for document:', err);
        res.sendStatus(500);
    }
};

const EditStatus = async (req, res) => {
    try {
        const updatedDoc = await Todo.findByIdAndUpdate(req.body.id, { completed: req.body.completed }, { returnDocument: "after" });
        res.send(updatedDoc);
    }
    catch (err) {
        console.error('Failed to update complete for document:', err);
        res.sendStatus(500);
    }
};

module.exports = {
    FetchTodos,
    CleanList,
    GetTodos,
    CreateTodo,
    DeleteTodo,
    EditText,
    EditStatus
  };