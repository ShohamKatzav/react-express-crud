const Project = require("../models/Project");
const Todo = require("../models/Todo");
const {
    DEFAULT_PROJECT,
    ensureDefaultProject,
    ensureProjectExists,
    listProjectsWithCounts,
    normalizeProjectName,
} = require("../utils/projectHelpers");

const GetProjects = async (req, res) => {
    try {
        const projects = await listProjectsWithCounts(req.user.sub);
        res.send(projects);
    } catch (err) {
        console.error('Failed to retrieve projects:', err);
        res.sendStatus(500);
    }
};

const CreateProject = async (req, res) => {
    try {
        const projectName = normalizeProjectName(req.body.name);
        const project = await ensureProjectExists(req.user.sub, projectName);
        const projects = await listProjectsWithCounts(req.user.sub);

        res.status(201).send({
            created: {
                _id: project._id,
                name: project.name,
                isDefault: project.name === DEFAULT_PROJECT,
                tasksCount: projects.find((item) => String(item._id) === String(project._id))?.tasksCount || 0,
            },
            projects,
        });
    } catch (err) {
        console.error('Failed to create project:', err);
        res.sendStatus(500);
    }
};

const UpdateProject = async (req, res) => {
    try {
        const project = await Project.findOne({ _id: req.params.id, user_id: req.user.sub }).exec();
        if (!project) {
            return res.sendStatus(404);
        }

        if (project.name === DEFAULT_PROJECT) {
            return res.status(400).send({ message: 'The Personal project is reserved as a fallback.' });
        }

        const nextName = normalizeProjectName(req.body.name);
        const nextNameLower = nextName.toLowerCase();

        const existingProject = await Project.findOne({
            _id: { $ne: project._id },
            user_id: req.user.sub,
            nameLower: nextNameLower,
        }).exec();

        if (existingProject) {
            return res.status(409).send({ message: 'A project with that name already exists.' });
        }

        const previousName = project.name;
        project.name = nextName;
        project.nameLower = nextNameLower;
        await project.save();

        await Todo.updateMany(
            { user_id: req.user.sub, project: previousName },
            { project: nextName }
        );

        const projects = await listProjectsWithCounts(req.user.sub);
        res.send({ projects });
    } catch (err) {
        console.error('Failed to update project:', err);
        res.sendStatus(500);
    }
};

const DeleteProject = async (req, res) => {
    try {
        const project = await Project.findOne({ _id: req.params.id, user_id: req.user.sub }).exec();
        if (!project) {
            return res.sendStatus(404);
        }

        if (project.name === DEFAULT_PROJECT) {
            return res.status(400).send({ message: 'The Personal project cannot be deleted.' });
        }

        await ensureDefaultProject(req.user.sub);
        await Todo.updateMany(
            { user_id: req.user.sub, project: project.name },
            { project: DEFAULT_PROJECT }
        );
        await Project.deleteOne({ _id: project._id, user_id: req.user.sub });

        const projects = await listProjectsWithCounts(req.user.sub);
        res.send({ projects, reassignedTo: DEFAULT_PROJECT });
    } catch (err) {
        console.error('Failed to delete project:', err);
        res.sendStatus(500);
    }
};

module.exports = {
    GetProjects,
    CreateProject,
    UpdateProject,
    DeleteProject,
};
