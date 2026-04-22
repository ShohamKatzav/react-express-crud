const Project = require("../models/Project");
const Todo = require("../models/Todo");

const DEFAULT_PROJECT = 'Personal';

const normalizeProjectName = (value) => {
    const normalized = String(value || '').trim().replace(/\s+/g, ' ');

    if (!normalized) {
        return DEFAULT_PROJECT;
    }

    return normalized.slice(0, 40);
};

const buildProjectLookupName = (name) => normalizeProjectName(name).toLowerCase();

const ensureProjectExists = async (userId, projectName) => {
    const normalizedName = normalizeProjectName(projectName);
    const nameLower = buildProjectLookupName(normalizedName);

    const existingProject = await Project.findOne({ user_id: userId, nameLower }).exec();
    if (existingProject) {
        return existingProject;
    }

    return Project.create({
        user_id: userId,
        name: normalizedName,
        nameLower,
    });
};

const ensureDefaultProject = async (userId) => ensureProjectExists(userId, DEFAULT_PROJECT);

const syncProjectsFromTodos = async (userId) => {
    await ensureDefaultProject(userId);

    const distinctProjectNames = await Todo.find({ user_id: userId }).distinct('project');
    const validNames = distinctProjectNames.map(normalizeProjectName).filter(Boolean);
    const uniqueNames = [...new Set(validNames)];

    await Promise.all(uniqueNames.map((projectName) => ensureProjectExists(userId, projectName)));
};

const listProjectsWithCounts = async (userId) => {
    await syncProjectsFromTodos(userId);

    const [projects, counts] = await Promise.all([
        Project.find({ user_id: userId }).sort({ name: 1 }).lean(),
        Todo.aggregate([
            { $match: { user_id: userId } },
            { $group: { _id: '$project', count: { $sum: 1 } } },
        ]),
    ]);

    const countsMap = counts.reduce((accumulator, item) => {
        accumulator[normalizeProjectName(item._id)] = item.count;
        return accumulator;
    }, {});

    return projects.map((project) => ({
        _id: project._id,
        name: project.name,
        isDefault: project.name === DEFAULT_PROJECT,
        tasksCount: countsMap[project.name] || 0,
    }));
};

module.exports = {
    DEFAULT_PROJECT,
    ensureDefaultProject,
    ensureProjectExists,
    listProjectsWithCounts,
    normalizeProjectName,
};
