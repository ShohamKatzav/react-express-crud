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
    EditStatus }
    = require("../controllers/TodoController");

router.post("/api/v1/fetchTodos", guard.check(['create:todos']), FetchTodos);
router.delete("/api/v1/cleanList", guard.check(['delete:todos']), CleanList);
router.get("/api/v1/todos", guard.check(['read:todos']), GetTodos);
router.post("/api/v1/todos", guard.check(['create:todos']), CreateTodo);
router.delete("/api/v1/todos", guard.check(['delete:todos']), DeleteTodo);
router.put("/api/v1/editText", guard.check(['update:todos']), EditText);
router.put("/api/v1/editStatus", guard.check(['update:todos']), EditStatus);

module.exports = router;