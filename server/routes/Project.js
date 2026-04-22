const express = require("express");
const router = express.Router();
const guard = require("express-jwt-permissions")();

const {
    GetProjects,
    CreateProject,
    UpdateProject,
    DeleteProject,
} = require("../controllers/ProjectController");

router.get("/api/v1/projects", guard.check(['read:todos']), GetProjects);
router.post("/api/v1/projects", guard.check(['create:todos']), CreateProject);
router.put("/api/v1/projects/:id", guard.check(['update:todos']), UpdateProject);
router.delete("/api/v1/projects/:id", guard.check(['delete:todos']), DeleteProject);

module.exports = router;
