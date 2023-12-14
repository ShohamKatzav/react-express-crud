const express = require("express");
const router = express.Router();
const guard = require("express-jwt-permissions")();

const {
    FetchTodos,
    CleanList,
    GetTodos,
    CreateTodo,
    DeleteTodo,
    EditText,
    EditStatus,
    DeleteSelected,
    ChangeSelectedStatus }
    = require("../controllers/TodoController");

router.post("/api/v1/fetchTodos", guard.check(['create:todos']), FetchTodos);
router.delete("/api/v1/cleanList", guard.check(['delete:todos']), CleanList);
router.get("/api/v1/todo", guard.check(['read:todos']), GetTodos);
router.post("/api/v1/todo", guard.check(['create:todos']), CreateTodo);
router.delete("/api/v1/todo", guard.check(['delete:todos']), DeleteTodo);
router.put("/api/v1/todo/editText", guard.check(['update:todos']), EditText);
router.put("/api/v1/todo/editStatus", guard.check(['update:todos']), EditStatus);
router.delete("/api/v1/delete-selected", guard.check(['delete:todos']), DeleteSelected);
router.put("/api/v1/change-selected-status", guard.check(['update:todos']), ChangeSelectedStatus);

module.exports = router;