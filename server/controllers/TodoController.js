const { fetchTodos } = require("../config/mongodb");
const Todo = require("../models/Todo");
const PRIORITIES = ['low', 'medium', 'high'];

const normalizePriority = (value) => {
    const normalized = String(value || '').trim().toLowerCase();

    if (normalized === 'urgent') {
        return 'high';
    }

    if (normalized === 'normal' || normalized === '') {
        return 'medium';
    }

    if (PRIORITIES.includes(normalized)) {
        return normalized;
    }

    return 'medium';
};

const normalizeDueDate = (value) => {
    if (!value) {
        return '';
    }

    const normalized = String(value).trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
        return '';
    }

    const parsedDate = new Date(`${normalized}T00:00:00Z`);
    if (Number.isNaN(parsedDate.getTime())) {
        return '';
    }

    const isoDate = parsedDate.toISOString().slice(0, 10);
    if (isoDate !== normalized) {
        return '';
    }

    return normalized;
};

const buildTodoPayload = (body = {}) => ({
    todo: String(body.value ?? body.todo ?? '').trim(),
    completed: Boolean(body.completed),
    priority: normalizePriority(body.priority),
    dueDate: normalizeDueDate(body.dueDate),
});

const buildTodoUpdatePayload = (body = {}) => {
    const updatePayload = {};

    if ('value' in body || 'todo' in body) {
        updatePayload.todo = String(body.value ?? body.todo ?? '').trim();
    }
    if ('completed' in body) {
        updatePayload.completed = Boolean(body.completed);
    }
    if ('priority' in body) {
        updatePayload.priority = normalizePriority(body.priority);
    }
    if ('dueDate' in body) {
        updatePayload.dueDate = normalizeDueDate(body.dueDate);
    }

    return updatePayload;
};

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
            const payload = buildTodoPayload(req.body);
            const newDoc = await Todo.create({ user_id: req.user.sub, ...payload });
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
                ...buildTodoPayload(item),
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
        await Todo.findOneAndDelete({ _id: req.body.id, user_id: req.user.sub });
        res.sendStatus(204);
    }
    catch (err) {
        console.error('Failed to delete document:', err);
        res.sendStatus(500);
    }
};

const EditText = async (req, res) => {
    try {
        const payload = buildTodoUpdatePayload(req.body);
        const updatedDoc = await Todo.findOneAndUpdate(
            { _id: req.body.id, user_id: req.user.sub },
            payload,
            { returnDocument: "after" }
        );
        res.send(updatedDoc);
    }
    catch (err) {
        console.error('Failed to update complete for document:', err);
        res.sendStatus(500);
    }
};

const EditStatus = async (req, res) => {
    try {
        const updatedDoc = await Todo.findOneAndUpdate(
            { _id: req.body.id, user_id: req.user.sub },
            { completed: req.body.completed },
            { returnDocument: "after" }
        );
        res.send(updatedDoc);
    }
    catch (err) {
        console.error('Failed to update complete for document:', err);
        res.sendStatus(500);
    }
};

const EditPriority = async (req, res) => {
    try {
        const updatedDoc = await Todo.findOneAndUpdate(
            { _id: req.body.id, user_id: req.user.sub },
            { priority: normalizePriority(req.body.priority) },
            { returnDocument: "after" }
        );
        res.send(updatedDoc);
    }
    catch (err) {
        console.error('Failed to update priority for document:', err);
        res.sendStatus(500);
    }
};

const EditDueDate = async (req, res) => {
    try {
        const updatedDoc = await Todo.findOneAndUpdate(
            { _id: req.body.id, user_id: req.user.sub },
            { dueDate: normalizeDueDate(req.body.dueDate) },
            { returnDocument: "after" }
        );
        res.send(updatedDoc);
    }
    catch (err) {
        console.error('Failed to update due date for document:', err);
        res.sendStatus(500);
    }
};

const DeleteSelected = async (req, res) => {
    try {
        await Todo.deleteMany({
            user_id: req.user.sub,
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
            user_id: req.user.sub,
            _id: {
                $in: req.body.ids
            }
        },
        { completed: req.body.completed });
        const updatedDoc = await Todo.find({
            user_id: req.user.sub,
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
    EditPriority,
    EditDueDate,
    DeleteSelected,
    ChangeSelectedStatus
};
