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

const ImportTodos = async (req, res) => {
    try {
        const items = Array.isArray(req.body.todos) ? req.body.todos : [];
        const sanitizedTodos = items
            .map((item) => ({
                user_id: req.user.sub,
                todo: String(item.value || "").trim(),
                completed: Boolean(item.completed),
            }))
            .filter((item) => item.todo);

        if (!sanitizedTodos.length) {
            return res.status(400).send({ message: "No valid todos were provided." });
        }

        const count = await Todo.find({ user_id: req.user.sub }).count();
        const availableSlots = Math.max(150 - count, 0);

        if (availableSlots === 0) {
            return res.status(409).send({ message: "Max list size is 150", inserted: [], skipped: sanitizedTodos.length });
        }

        const todosToInsert = sanitizedTodos.slice(0, availableSlots);
        const insertedTodos = await Todo.insertMany(todosToInsert);

        return res.status(200).send({
            inserted: insertedTodos,
            skipped: sanitizedTodos.length - todosToInsert.length,
        });
    } catch (err) {
        console.error('Failed to import todos:', err);
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

const DeleteSelected = async (req, res) => {
    try {
        await Todo.deleteMany({
            _id: {
                $in: req.body.ids
            }
        });
        res.sendStatus(204);
    }
    catch (err) {
        console.error('Failed to delete document:', err);
        res.sendStatus(500);
    }
};

const ChangeSelectedStatus = async (req, res) => {
    try {
        await Todo.updateMany({
            _id: {
                $in: req.body.ids
            }
        },
        { completed: req.body.completed });
        const updatedDoc = await Todo.find({
            _id: {
                $in: req.body.ids
            }
        }).exec();
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
    ImportTodos,
    DeleteTodo,
    EditText,
    EditStatus,
    DeleteSelected,
    ChangeSelectedStatus
};
