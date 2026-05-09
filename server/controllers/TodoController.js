const { fetchTodos } = require("../config/mongodb");
const Todo = require("../models/Todo");
const { ensureProjectExists, normalizeProjectName } = require("../utils/projectHelpers");
const PRIORITIES = ['low', 'medium', 'high'];
const DEFAULT_TODO_PAGE = 1;
const DEFAULT_TODO_LIMIT = 25;
const MAX_TODO_LIMIT = 150;

const parsePositiveInteger = (value, fallback) => {
    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const getTodoPagination = (query = {}) => {
    const page = parsePositiveInteger(query.page, DEFAULT_TODO_PAGE);
    const requestedLimit = parsePositiveInteger(query.limit ?? query.pageSize, DEFAULT_TODO_LIMIT);
    const limit = Math.min(requestedLimit, MAX_TODO_LIMIT);

    return {
        page,
        limit,
        skip: (page - 1) * limit,
    };
};

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
    project: normalizeProjectName(body.project),
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
    if ('project' in body) {
        updatePayload.project = normalizeProjectName(body.project);
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
        const projectNames = [...new Set(todos.map((todo) => normalizeProjectName(todo.project)).filter(Boolean))];
        await Promise.all(projectNames.map((projectName) => ensureProjectExists(req.user.sub, projectName)));
        todos.length ? res.send(todos) : res.sendStatus(204);
    } catch (err) {
        console.error('Failed to retrieve todos:', err);
        res.status(500).send({ message: 'Unable to retrieve todos' });
    }
};

const CleanList = async (req, res) => {
    try {
        await Todo.deleteMany({ user_id: req.user.sub });
        res.sendStatus(204);
    }
    catch (err) {
        console.error('Failed to delete document:', err);
        res.status(500).send({ message: 'Unable to clear list' });
    }
};

const GetTodos = async (req, res) => {
    try {
        const { page, limit, skip } = getTodoPagination(req.query);
        const userQuery = { user_id: req.user.sub };
        const [todos, total] = await Promise.all([
            Todo.find(userQuery).sort({ _id: 1 }).skip(skip).limit(limit).exec(),
            Todo.countDocuments(userQuery),
        ]);

        res.send({
            data: todos,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (err) {
        console.error('Failed to retrieve todos:', err);
        res.status(500).send({ message: 'Unable to retrieve todos' });
    }
};

const CreateTodo = async (req, res) => {
    try {
        const count = await Todo.countDocuments({ user_id: req.user.sub });
        if (count >= 150) {
            return res.status(409).send({ message: 'Max list size is 150' });
        }
        const payload = buildTodoPayload(req.body);
        await ensureProjectExists(req.user.sub, payload.project);
        const newDoc = await Todo.create({ user_id: req.user.sub, ...payload });
        return res.status(201).send(newDoc);
    } catch (err) {
        console.error('Failed to insert document:', err);
        res.status(500).send({ message: 'Unable to create todo' });
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
            return res.status(400).send({ message: 'No valid todos were provided.' });
        }

        const count = await Todo.countDocuments({ user_id: req.user.sub });
        const availableSlots = Math.max(150 - count, 0);

        if (availableSlots === 0) {
            return res.status(409).send({ message: 'Max list size is 150', inserted: [], skipped: sanitizedTodos.length });
        }

        const todosToInsert = sanitizedTodos.slice(0, availableSlots);
        const projectNames = [...new Set(todosToInsert.map((todo) => todo.project).filter(Boolean))];
        await Promise.all(projectNames.map((projectName) => ensureProjectExists(req.user.sub, projectName)));
        const insertedTodos = await Todo.insertMany(todosToInsert);

        return res.status(200).send({
            inserted: insertedTodos,
            skipped: sanitizedTodos.length - todosToInsert.length,
        });
    } catch (err) {
        console.error('Failed to import todos:', err);
        res.status(500).send({ message: 'Unable to import todos' });
    }
};

const DeleteTodo = async (req, res) => {
    try {
        const deleted = await Todo.findOneAndDelete({ _id: req.body.id, user_id: req.user.sub });
        if (!deleted) {
            return res.status(404).send({ message: 'Todo not found' });
        }

        res.sendStatus(204);
    }
    catch (err) {
        console.error('Failed to delete document:', err);
        res.status(500).send({ message: 'Unable to delete todo' });
    }
};

const EditText = async (req, res) => {
    try {
        const payload = buildTodoUpdatePayload(req.body);
        if (payload.project) {
            await ensureProjectExists(req.user.sub, payload.project);
        }
        const updatedDoc = await Todo.findOneAndUpdate(
            { _id: req.body.id, user_id: req.user.sub },
            payload,
            { returnDocument: 'after' }
        );

        if (!updatedDoc) {
            return res.status(404).send({ message: 'Todo not found' });
        }

        res.send(updatedDoc);
    }
    catch (err) {
        console.error('Failed to update todo text:', err);
        res.status(500).send({ message: 'Unable to update todo' });
    }
};

const EditStatus = async (req, res) => {
    try {
        const updatedDoc = await Todo.findOneAndUpdate(
            { _id: req.body.id, user_id: req.user.sub },
            { completed: req.body.completed },
            { returnDocument: 'after' }
        );

        if (!updatedDoc) {
            return res.status(404).send({ message: 'Todo not found' });
        }

        res.send(updatedDoc);
    }
    catch (err) {
        console.error('Failed to update todo status:', err);
        res.status(500).send({ message: 'Unable to update todo status' });
    }
};

const EditProject = async (req, res) => {
    try {
        const nextProject = normalizeProjectName(req.body.project);
        await ensureProjectExists(req.user.sub, nextProject);
        const updatedDoc = await Todo.findOneAndUpdate(
            { _id: req.body.id, user_id: req.user.sub },
            { project: nextProject },
            { returnDocument: 'after' }
        );

        if (!updatedDoc) {
            return res.status(404).send({ message: 'Todo not found' });
        }

        res.send(updatedDoc);
    }
    catch (err) {
        console.error('Failed to update todo project:', err);
        res.status(500).send({ message: 'Unable to update todo project' });
    }
};

const EditPriority = async (req, res) => {
    try {
        const updatedDoc = await Todo.findOneAndUpdate(
            { _id: req.body.id, user_id: req.user.sub },
            { priority: normalizePriority(req.body.priority) },
            { returnDocument: 'after' }
        );

        if (!updatedDoc) {
            return res.status(404).send({ message: 'Todo not found' });
        }

        res.send(updatedDoc);
    }
    catch (err) {
        console.error('Failed to update todo priority:', err);
        res.status(500).send({ message: 'Unable to update todo priority' });
    }
};

const EditDueDate = async (req, res) => {
    try {
        const updatedDoc = await Todo.findOneAndUpdate(
            { _id: req.body.id, user_id: req.user.sub },
            { dueDate: normalizeDueDate(req.body.dueDate) },
            { returnDocument: 'after' }
        );

        if (!updatedDoc) {
            return res.status(404).send({ message: 'Todo not found' });
        }

        res.send(updatedDoc);
    }
    catch (err) {
        console.error('Failed to update todo due date:', err);
        res.status(500).send({ message: 'Unable to update todo due date' });
    }
};

const DeleteSelected = async (req, res) => {
    try {
        const result = await Todo.deleteMany({
            user_id: req.user.sub,
            _id: {
                $in: req.body.ids
            }
        });

        if (!result || result.deletedCount === 0) {
            return res.status(404).send({ message: 'No todos deleted' });
        }

        res.sendStatus(204);
    }
    catch (err) {
        console.error('Failed to delete documents:', err);
        res.status(500).send({ message: 'Unable to delete todos' });
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

        if (!updatedDoc || !updatedDoc.length) {
            return res.status(404).send({ message: 'No todos found' });
        }

        res.send(updatedDoc);
    }
    catch (err) {
        console.error('Failed to update todos status:', err);
        res.status(500).send({ message: 'Unable to update selected todos' });
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
    EditProject,
    EditStatus,
    EditPriority,
    EditDueDate,
    DeleteSelected,
    ChangeSelectedStatus
};
