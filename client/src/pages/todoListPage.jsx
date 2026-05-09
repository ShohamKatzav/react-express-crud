import { useEffect, useState } from "react";
import { useLocation, useNavigate } from 'react-router-dom';
import api from "../api";
import { useGridApiRef } from "@mui/x-data-grid";
import { toast } from 'react-toastify';
import { useAuth0 } from "@auth0/auth0-react";
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import CircularProgress from '@mui/material/CircularProgress';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import FolderRoundedIcon from '@mui/icons-material/FolderRounded';
import ListAltRoundedIcon from '@mui/icons-material/ListAltRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import TableRowsRoundedIcon from '@mui/icons-material/TableRowsRounded';
import TaskAltRoundedIcon from '@mui/icons-material/TaskAltRounded';
import ViewKanbanRoundedIcon from '@mui/icons-material/ViewKanbanRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import AddToDoDialog from "../dialogs/addTodoDialog";
import TodoTable from "../components/todoTable";
import LoginPage from "./loginPage";
import CleanTodosDialog from "../dialogs/cleanTodosDialog";
import EditTodoDialog from "../dialogs/editTodoDialog";
import ExportTodosDialog from "../dialogs/exportTodosDialog";
import ImportTodosDialog from "../dialogs/importTodosDialog";
import ManageProjectsDialog from "../dialogs/manageProjectsDialog";
import SelectedTodosDialog from "../dialogs/selectedTodosDialog";
import ProjectChip from "../components/projectChip";
import TodoBoard from "../components/todoBoard";
import TodoCalendar from "../components/todoCalendar";
import { DEFAULT_PROJECT, getDueDateState, normalizeProjectValue, sortTodosByUrgency } from "../utils/todoFields";

const normalizeTodoRecord = (todo) => ({
    ...todo,
    project: normalizeProjectValue(todo?.project),
    priority: todo?.priority || 'medium',
    dueDate: todo?.dueDate || '',
});

const normalizeProjectRecord = (project) => ({
    ...project,
    name: normalizeProjectValue(project?.name),
    tasksCount: Number(project?.tasksCount || 0),
    isDefault: Boolean(project?.isDefault),
});

const getTodosFromResponse = (response) => Array.isArray(response.data) ? response.data : response.data?.data || [];
const buildOptimisticTodoId = () => `optimistic-${Date.now()}-${Math.random().toString(36).slice(2)}`;

function TodoListPage() {
    const baseUrl = import.meta.env.VITE_APP_BASE_URL;
    const apiRef = useGridApiRef();
    const [currentPaginationModel, setCurrentPaginationModel] = useState({ page: 0, pageSize: 5 });
    const [dataToShow, setDataToShow] = useState([]);
    const [projects, setProjects] = useState([]);
    const [isDataRendered, setIsDataRendered] = useState(true);
    const [todoAdded, setTodoAdded] = useState(false);
    const [config, setConfig] = useState(null);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isProjectsDialogOpen, setIsProjectsDialogOpen] = useState(false);
    const [params, setParams] = useState({});
    const [selectedRows, setSelectedRows] = useState([]);
    const [isTodosLoading, setIsTodosLoading] = useState(false);
    const [statusFilter, setStatusFilter] = useState('all');
    const [priorityFilter, setPriorityFilter] = useState('all');
    const [projectFilter, setProjectFilter] = useState('all');
    const [viewMode, setViewMode] = useState('list');

    const { isAuthenticated, getAccessTokenSilently, isLoading } = useAuth0();

    const location = useLocation();
    const navigate = useNavigate();

    const notifySuceess = (text) => {
        toast.dismiss();
        toast.success(text);
    };
    const notifyWarning = (text) => {
        toast.dismiss();
        toast.warning(text);
    };
    const notifyError = (text) => {
        toast.dismiss();
        toast.error(text);
    };

    const updateGridPage = (page) => {
        apiRef.current?.setPaginationModel?.({
            page,
            pageSize: currentPaginationModel.pageSize,
        });
    };

    const loadWorkspace = async (existingConfig = null) => {
        if (!isAuthenticated) {
            return null;
        }

        setIsTodosLoading(true);
        try {
            let resolvedConfig = existingConfig;
            if (!resolvedConfig) {
                const accessToken = await getAccessTokenSilently();
                resolvedConfig = {
                    headers: { Authorization: `Bearer ${accessToken}` }
                };
                setConfig(resolvedConfig);
            }

            const [todoResponse, projectResponse] = await Promise.all([
                api.get(`/todo`, { ...resolvedConfig, params: { page: 1, limit: 150 } }),
                api.get(`/projects`, resolvedConfig),
            ]);

            setDataToShow(getTodosFromResponse(todoResponse).map(normalizeTodoRecord));
            setProjects(projectResponse.data.map(normalizeProjectRecord));
            return resolvedConfig;
        } catch (e) {
            console.log(e.message);
            return null;
        } finally {
            setIsTodosLoading(false);
        }
    };

    const refreshProjects = async (existingConfig = config) => {
        if (!existingConfig) {
            return;
        }

        try {
            const response = await api.get(`/projects`, existingConfig);
            setProjects(response.data.map(normalizeProjectRecord));
        } catch (e) {
            console.log(e.message);
        }
    };

    useEffect(() => {
        if (isAuthenticated) {
            loadWorkspace();
        }
    }, [isAuthenticated]);

    // Apply URL filters (e.g. ?status=overdue) when arriving at the page
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const status = params.get('status');
        if (status) {
            setStatusFilter(status);
        }
        const priority = params.get('priority');
        if (priority) {
            setPriorityFilter(priority);
        }
        const project = params.get('project');
        if (project) {
            setProjectFilter(normalizeProjectValue(project));
        }
    }, [location.search]);

    // If auth finished loading and user is not authenticated, send them home
    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            navigate('/');
        }
    }, [isLoading, isAuthenticated, navigate]);

    useEffect(() => {
        updateGridPage(0);
    }, [priorityFilter, projectFilter, statusFilter]);

    useEffect(() => {
        if (viewMode !== 'list' && selectedRows.length) {
            setSelectedRows([]);
        }
    }, [selectedRows.length, viewMode]);

    useEffect(() => {
        // Only reset the project filter if we actually have projects loaded.
        // This avoids overwriting a project filter applied from a URL param
        // before the projects list has been fetched.
        if (projects.length > 0 && projectFilter !== 'all' && !projects.some((project) => project.name === projectFilter)) {
            setProjectFilter('all');
        }
    }, [projectFilter, projects]);

    const fetchTodos = async (amount) => {
        try {
            const response = await api.post(`/fetchTodos`, { fetchAmount: amount }, config);
            if (response.status === 200) {
                setDataToShow((current) => [...current, ...response.data.map(normalizeTodoRecord)]);
                setTodoAdded(true);
                setIsDataRendered(false);
                notifySuceess("The fetch operation was completed successfully");
                await refreshProjects(config);
            }
            else {
                notifyError("Max list size is 150");
            }
        } catch (e) {
            console.log(e.message);
        }
    };

    const cleanList = async () => {
        const previousTodos = dataToShow;
        const previousSelectedRows = selectedRows;
        updateGridPage(0);
        setDataToShow([]);
        setSelectedRows([]);

        try {
            const response = await api.delete(`/cleanList`, config);
            if (response.status === 204) {
                notifySuceess("The clean operation was completed successfully");
                await refreshProjects(config);
            }
            else {
                setDataToShow(previousTodos);
                setSelectedRows(previousSelectedRows);
                notifyError("Could not clean the list");
            }
        } catch (e) {
            setDataToShow(previousTodos);
            setSelectedRows(previousSelectedRows);
            console.log(e.message);
            notifyError("Could not clean the list");
        }
    };

    const addTodo = async ({ completed, dueDate, priority, project, value }) => {
        const optimisticId = buildOptimisticTodoId();
        const optimisticTodo = normalizeTodoRecord({
            _id: optimisticId,
            todo: value,
            project,
            completed,
            priority,
            dueDate,
        });

        setTodoAdded(true);
        setIsDataRendered(false);
        setDataToShow((current) => [...current, optimisticTodo]);

        try {
            const response = await api.post(`/todo`, { value, completed, priority, dueDate, project }, config);
            setDataToShow((current) => current.map((todo) => (
                todo._id === optimisticId ? normalizeTodoRecord(response.data) : todo
            )));
            notifySuceess("Todo added successfully");
            await refreshProjects(config);
            return true;
        } catch (e) {
            setDataToShow((current) => current.filter((todo) => todo._id !== optimisticId));
            if (e.response?.status === 409) {
                notifyError("Max list size is 150");
                return;
            }

            console.log(e.message);
            notifyError("Could not add todo");
        }
        return false;
    };

    const importTodos = async (todos) => {
        const optimisticTodos = todos.map((todo) => normalizeTodoRecord({
            _id: buildOptimisticTodoId(),
            todo: todo.value,
            project: todo.project,
            completed: todo.completed,
            priority: todo.priority,
            dueDate: todo.dueDate,
        }));

        if (optimisticTodos.length) {
            setDataToShow((current) => [...current, ...optimisticTodos]);
            setTodoAdded(true);
            setIsDataRendered(false);
        }

        try {
            const response = await api.post(`/todo/import`, { todos }, config);
            const insertedTodos = response.data?.inserted?.map(normalizeTodoRecord) || [];
            const skippedTodos = response.data?.skipped || 0;

            if (insertedTodos.length) {
                setDataToShow((current) => [
                    ...current.filter((todo) => !optimisticTodos.some((optimisticTodo) => optimisticTodo._id === todo._id)),
                    ...insertedTodos,
                ]);
                await refreshProjects(config);
            } else {
                setDataToShow((current) => current.filter((todo) => !optimisticTodos.some((optimisticTodo) => optimisticTodo._id === todo._id)));
            }

            if (insertedTodos.length && skippedTodos) {
                notifyWarning(`${insertedTodos.length} todos imported. ${skippedTodos} skipped because the list limit is 150`);
                return true;
            }

            if (insertedTodos.length) {
                notifySuceess(`${insertedTodos.length} todos imported successfully`);
                return true;
            }

            notifyWarning("No todos were imported");
        } catch (e) {
            setDataToShow((current) => current.filter((todo) => !optimisticTodos.some((optimisticTodo) => optimisticTodo._id === todo._id)));
            if (e.response?.status === 409) {
                notifyError("Max list size is 150");
                return false;
            }
            console.log(e.message);
            notifyError("Could not import todos");
        }
        return false;
    };

    const createProject = async (name) => {
        const normalizedName = String(name || '').trim();
        if (!normalizedName) {
            notifyError("Please enter a project name");
            return false;
        }

        try {
            const response = await api.post(`/projects`, { name: normalizedName }, config);
            setProjects(response.data.projects.map(normalizeProjectRecord));
            notifySuceess(`Project "${normalizeProjectValue(normalizedName)}" is ready`);
            return true;
        } catch (e) {
            console.log(e.message);
            notifyError("Could not create project");
            return false;
        }
    };

    const updateProject = async (projectId, name) => {
        const normalizedName = String(name || '').trim();
        if (!normalizedName) {
            notifyError("Project name cannot be empty");
            return false;
        }

        const existingProject = projects.find((project) => project._id === projectId);
        try {
            await api.put(`/projects/${projectId}`, { name: normalizedName }, config);
            await loadWorkspace(config);
            if (projectFilter === existingProject?.name) {
                setProjectFilter(normalizeProjectValue(normalizedName));
            }
            notifySuceess("Project updated successfully");
            return true;
        } catch (e) {
            if (e.response?.status === 409) {
                notifyError("A project with that name already exists");
                return false;
            }
            if (e.response?.status === 400) {
                notifyWarning(e.response.data?.message || "That project cannot be renamed");
                return false;
            }
            console.log(e.message);
            notifyError("Could not update project");
            return false;
        }
    };

    const deleteProject = async (projectId, projectName) => {
        try {
            await api.delete(`/projects/${projectId}`, config);
            await loadWorkspace(config);
            if (projectFilter === projectName) {
                setProjectFilter('all');
            }
            notifyWarning(`Project deleted. Its tasks were moved to ${DEFAULT_PROJECT}`);
            return true;
        } catch (e) {
            if (e.response?.status === 400) {
                notifyWarning(e.response.data?.message || "That project cannot be deleted");
                return false;
            }
            console.log(e.message);
            notifyError("Could not delete project");
            return false;
        }
    };

    const deleteTodo = async (todo_Id) => {
        const todoToDelete = dataToShow.find((todo) => todo._id === todo_Id);
        const wasSelected = selectedRows.includes(todo_Id);
        setDataToShow((current) => current.filter((item) => item._id !== todo_Id));
        setSelectedRows((current) => current.filter((id) => id !== todo_Id));

        try {
            await api.delete(`/todo`, { headers: { Authorization: config.headers.Authorization }, data: { id: todo_Id } });
            notifySuceess("Todo deleted successfully");
            await refreshProjects(config);
        } catch (e) {
            if (todoToDelete) {
                setDataToShow((current) => current.some((todo) => todo._id === todo_Id) ? current : [...current, todoToDelete]);
            }
            if (wasSelected) {
                setSelectedRows((current) => current.includes(todo_Id) ? current : [...current, todo_Id]);
            }
            console.log(e.message);
            notifyError("Could not delete todo");
        }
    };

    useEffect(() => {
        if (dataToShow.length) {
            if (!isDataRendered) {
                setIsDataRendered(true);
            }
            else {
                const lastPage = Math.ceil(dataToShow.length / currentPaginationModel.pageSize) - 1;
                if (currentPaginationModel.page > lastPage || (currentPaginationModel.page < lastPage && todoAdded)) {
                    updateGridPage(lastPage);
                    setTodoAdded(false);
                }
            }
        }
    }, [currentPaginationModel.page, currentPaginationModel.pageSize, dataToShow, isDataRendered, todoAdded]);

    const openEditTodoDialog = () => {
        setIsEditDialogOpen(true);
    };
    const closeEditTodoDialog = () => {
        notifyWarning("Edit operation canceled");
        setIsEditDialogOpen(false);
    };
    const handleEditDialogSubmit = async (e) => {
        e.preventDefault();
        const wasUpdated = await sendPutRequestAndUpdateState(params, "/todo/editText");
        if (wasUpdated) {
            notifySuceess("Todo updated successfully");
            setIsEditDialogOpen(false);
            await refreshProjects(config);
        } else {
            notifyError("Could not update todo");
        }
    };

    const editText = (todo_Id) => {
        const todoToEdit = dataToShow.find((todo) => todo._id === todo_Id);
        setParams({
            id: todo_Id,
            todo: todoToEdit.todo,
            project: todoToEdit.project || DEFAULT_PROJECT,
            completed: todoToEdit.completed,
            priority: todoToEdit.priority || 'medium',
            dueDate: todoToEdit.dueDate || '',
        });
        openEditTodoDialog();
    };
    const editStatus = (todo_Id) => {
        const todoToUpdate = dataToShow.find((todo) => todo._id === todo_Id);
        if (!todoToUpdate) {
            return;
        }

        const nextParams = { id: todo_Id, completed: !todoToUpdate.completed };
        sendPutRequestAndUpdateState(nextParams, "/todo/editStatus").then((wasUpdated) => {
            if (wasUpdated) {
                notifySuceess("Todo status changed");
            } else {
                notifyError("Could not change todo status");
            }
        });
    };
    const editPriority = (todo_Id, nextPriority) => {
        const currentPriority = dataToShow.find((todo) => todo._id === todo_Id)?.priority || 'medium';

        if (currentPriority === nextPriority) {
            return Promise.resolve(true);
        }

        return sendPutRequestAndUpdateState({ id: todo_Id, priority: nextPriority }, "/todo/editPriority").then((wasUpdated) => {
            if (wasUpdated) {
                notifySuceess(`Priority changed to ${nextPriority}`);
            } else {
                notifyError("Could not change todo priority");
            }
            return wasUpdated;
        });
    };
    const editDueDate = (todo_Id, nextDueDate) => {
        const currentDueDate = dataToShow.find((todo) => todo._id === todo_Id)?.dueDate || '';

        if (currentDueDate === nextDueDate) {
            return Promise.resolve(true);
        }

        return sendPutRequestAndUpdateState({ id: todo_Id, dueDate: nextDueDate }, "/todo/editDueDate").then((wasUpdated) => {
            if (wasUpdated) {
                notifySuceess(nextDueDate ? "Due date updated" : "Due date cleared");
            } else {
                notifyError("Could not change due date");
            }
            return wasUpdated;
        });
    };
    const editProject = (todo_Id, nextProject) => {
        const currentProject = dataToShow.find((todo) => todo._id === todo_Id)?.project || DEFAULT_PROJECT;

        if (currentProject === nextProject) {
            return Promise.resolve(true);
        }

        return sendPutRequestAndUpdateState({ id: todo_Id, project: nextProject }, "/todo/editProject").then(async (wasUpdated) => {
            if (wasUpdated) {
                notifySuceess(`Task moved to ${nextProject}`);
                await refreshProjects(config);
            } else {
                notifyError("Could not move task to another project");
            }
            return wasUpdated;
        });
    };

    const sendPutRequestAndUpdateState = async (requestParams, endPoint) => {
        const previousTodo = dataToShow.find((todo) => todo._id === requestParams.id);
        if (!previousTodo) {
            return false;
        }

        setDataToShow((current) => current.map((todo) => (
            todo._id === requestParams.id
                ? normalizeTodoRecord({ ...todo, ...requestParams })
                : todo
        )));

        try {
            const response = await api.put(endPoint, requestParams, config);
            if (!response.data) {
                setDataToShow((current) => current.map((todo) => (
                    todo._id === requestParams.id ? previousTodo : todo
                )));
                return false;
            }
            setDataToShow((current) => current.map((todo) => (
                todo._id === requestParams.id ? normalizeTodoRecord(response.data) : todo
            )));
            return true;
        } catch (e) {
            setDataToShow((current) => current.map((todo) => (
                todo._id === requestParams.id ? previousTodo : todo
            )));
            console.log(e.message);
        }
        return false;
    };

    const deleteSelected = async () => {
        const idsToDelete = [...selectedRows];
        const deletedTodos = dataToShow.filter((todo) => idsToDelete.includes(todo._id));
        setDataToShow((current) => current.filter((todo) => !idsToDelete.includes(todo._id)));
        setSelectedRows([]);

        try {
            await api.delete(`/delete-selected`, {
                headers: { Authorization: config.headers.Authorization }, data: { ids: idsToDelete }
            });
            notifySuceess("Todos deleted successfully");
            await refreshProjects(config);
        } catch (e) {
            setDataToShow((current) => {
                const currentIds = new Set(current.map((todo) => todo._id));
                return [...current, ...deletedTodos.filter((todo) => !currentIds.has(todo._id))];
            });
            setSelectedRows(idsToDelete);
            console.log(e.message);
            notifyError("Could not delete selected todos");
        }
    };
    const changeSelectedStatus = async (newStatus) => {
        const idsToUpdate = [...selectedRows];
        const previousTodos = dataToShow.filter((todo) => idsToUpdate.includes(todo._id));
        const todosToUpdate = previousTodos.filter((todo) => todo.completed !== newStatus);

        if (todosToUpdate.length === 0) {
            notifyWarning("Nothing to change");
            return;
        }

        const requestParams = { ids: idsToUpdate, completed: newStatus };
        setDataToShow((current) => current.map((todo) => (
            idsToUpdate.includes(todo._id) ? normalizeTodoRecord({ ...todo, completed: newStatus }) : todo
        )));

        try {
            const response = await api.put(`/change-selected-status`, requestParams, config);
            const updatedTodos = response.data.map(normalizeTodoRecord);
            setDataToShow((current) => {
                return current.map((todo) => updatedTodos.find((updatedTodo) => updatedTodo._id === todo._id) || todo);
            });
            notifySuceess("Todos status changed");
        } catch (e) {
            setDataToShow((current) => current.map((todo) => previousTodos.find((previousTodo) => previousTodo._id === todo._id) || todo));
            console.log(e.message);
            notifyError("Could not change selected todos");
        }
    };

    if (isLoading) {
        return (
            <Box className="page-shell">
                <Paper className="surface-panel fade-in-up" sx={{ p: 4, borderRadius: '36px', textAlign: 'center' }}>
                    <Stack alignItems="center" spacing={2}>
                        <CircularProgress color="secondary" />
                        <Typography variant="h5">Loading your workspace...</Typography>
                    </Stack>
                </Paper>
            </Box>
        );
    }

    const isWorkspaceBootstrapping = isTodosLoading && !dataToShow.length && !projects.length;

    if (isWorkspaceBootstrapping) {
        return (
            <Box className="page-shell">
                <Paper className="surface-panel fade-in-up" sx={{ p: 4, borderRadius: '36px', textAlign: 'center' }}>
                    <Stack alignItems="center" spacing={2}>
                        <CircularProgress color="secondary" />
                        <Typography variant="h5">Loading your workspace...</Typography>
                        <Typography sx={{ color: 'text.secondary' }}>
                            Pulling tasks, projects, and view settings into place.
                        </Typography>
                    </Stack>
                </Paper>
            </Box>
        );
    }

    const todos = dataToShow.map(normalizeTodoRecord);
    const totalTodos = todos.length;
    const completedTodos = todos.filter((todo) => todo.completed).length;
    const remainingTodos = totalTodos - completedTodos;
    const overdueTodos = todos.filter((todo) => !todo.completed && getDueDateState(todo.dueDate || '') === 'overdue').length;
    const todayTodos = todos.filter((todo) => !todo.completed && getDueDateState(todo.dueDate || '') === 'today').length;
    const completionRate = totalTodos ? `${Math.round((completedTodos / totalTodos) * 100)}%` : '0%';
    const filteredTodos = todos.filter((todo) => {
        if (statusFilter === 'done' && !todo.completed) {
            return false;
        }
        if (statusFilter === 'active' && todo.completed) {
            return false;
        }
        if (statusFilter === 'overdue' && (todo.completed || getDueDateState(todo.dueDate || '') !== 'overdue')) {
            return false;
        }

        if (priorityFilter !== 'all' && (todo.priority || 'medium') !== priorityFilter) {
            return false;
        }

        if (projectFilter !== 'all' && (todo.project || DEFAULT_PROJECT) !== projectFilter) {
            return false;
        }

        return true;
    });
    const statusCounts = {
        all: totalTodos,
        active: remainingTodos,
        done: completedTodos,
        overdue: overdueTodos,
    };
    const priorityCounts = {
        all: totalTodos,
        high: todos.filter((todo) => (todo.priority || 'medium') === 'high').length,
        medium: todos.filter((todo) => (todo.priority || 'medium') === 'medium').length,
        low: todos.filter((todo) => (todo.priority || 'medium') === 'low').length,
    };
    const overdueSpotlightTodos = sortTodosByUrgency(
        todos.filter((todo) => !todo.completed && getDueDateState(todo.dueDate || '') === 'overdue')
    ).slice(0, 4);
    const projectOptions = projects.length ? projects : [{ _id: DEFAULT_PROJECT, name: DEFAULT_PROJECT, tasksCount: totalTodos, isDefault: true }];

    const stats = [
        {
            label: 'Tasks in play',
            value: totalTodos,
            helper: 'Everything currently in your workspace',
            accent: 'rgba(217, 103, 77, 0.14)',
            icon: <ListAltRoundedIcon color="secondary" />,
        },
        {
            label: 'Completed',
            value: completedTodos,
            helper: 'Work you have already wrapped up',
            accent: 'rgba(63, 138, 105, 0.12)',
            icon: <TaskAltRoundedIcon color="success" />,
        },
        {
            label: 'Overdue',
            value: overdueTodos,
            helper: overdueTodos ? 'These need attention first' : 'Nothing is slipping right now',
            accent: overdueTodos ? 'rgba(211, 47, 47, 0.12)' : 'rgba(216, 164, 61, 0.12)',
            icon: <WarningAmberRoundedIcon sx={{ color: overdueTodos ? '#d32f2f' : '#d8a43d' }} />,
        },
        {
            label: 'Completion rate',
            value: completionRate,
            helper: todayTodos ? `${todayTodos} due today, ${remainingTodos} still in focus` : `${remainingTodos} still in focus`,
            accent: 'rgba(216, 164, 61, 0.15)',
            icon: <AutoAwesomeRoundedIcon sx={{ color: '#d8a43d' }} />,
        },
    ];

    const statusOptions = [
        { key: 'all', label: 'All', count: statusCounts.all },
        { key: 'active', label: 'In focus', count: statusCounts.active },
        { key: 'overdue', label: 'Overdue', count: statusCounts.overdue },
        { key: 'done', label: 'Done', count: statusCounts.done },
    ];
    const priorityOptions = [
        { key: 'all', label: 'All priorities', count: priorityCounts.all },
        { key: 'high', label: 'High', count: priorityCounts.high },
        { key: 'medium', label: 'Medium', count: priorityCounts.medium },
        { key: 'low', label: 'Low', count: priorityCounts.low },
    ];
    const viewOptions = [
        { key: 'list', label: 'List', icon: <TableRowsRoundedIcon /> },
        { key: 'board', label: 'Board', icon: <ViewKanbanRoundedIcon /> },
        { key: 'calendar', label: 'Calendar', icon: <CalendarMonthRoundedIcon /> },
    ];

    return isAuthenticated ? (
        <Box className="page-shell">
            <Paper className="surface-panel fade-in-up" sx={{ p: { xs: 2, md: 2.6 }, borderRadius: '34px' }}>
                <Stack direction={{ xs: 'column', xl: 'row' }} justifyContent="space-between" spacing={2}>
                    <Box sx={{ maxWidth: 760 }}>
                        <p className="eyebrow">Workspace</p>
                        <Typography className="page-title" sx={{ fontSize: { xs: '2.1rem', md: '3rem' }, maxWidth: { xs: '14ch', md: '20ch' } }} variant="h1">
                            Keep the task view front and center.
                        </Typography>
                        <Typography className="page-subtitle" sx={{ mt: 1 }}>
                            Actions, filters, and project controls stay compact here so the real work stays visible immediately below.
                        </Typography>
                        <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mt: 1.8 }}>
                            <Chip label={`${projectOptions.length} project${projectOptions.length === 1 ? '' : 's'}`} variant="outlined" />
                            <Chip color="secondary" label={`${remainingTodos} in focus`} variant="outlined" />
                            <Chip color="error" label={`${overdueTodos} overdue`} variant="outlined" />
                            <Chip color="success" label={`${completedTodos} completed`} variant="outlined" />
                        </Stack>
                    </Box>
                    <Stack direction="row" flexWrap="wrap" gap={1} sx={{ alignContent: 'flex-start' }}>
                        <AddToDoDialog
                            addTodo={addTodo}
                            notifyError={notifyError}
                            notifyWarning={notifyWarning}
                            projects={projectOptions}
                        />
                        <ImportTodosDialog
                            fetchTodos={fetchTodos}
                            importTodos={importTodos}
                            notifyError={notifyError}
                            notifyWarning={notifyWarning}
                        />
                        <ExportTodosDialog
                            notifyError={notifyError}
                            notifySuccess={notifySuceess}
                            todos={todos}
                        />
                        <CleanTodosDialog
                            cleanList={cleanList}
                            dataToShow={dataToShow}
                            notifyWarning={notifyWarning}
                        />
                        <SelectedTodosDialog
                            changeSelectedStatus={changeSelectedStatus}
                            deleteSelected={deleteSelected}
                            notifyWarning={notifyWarning}
                            selectedCount={selectedRows.length}
                        />
                    </Stack>
                </Stack>
            </Paper>

            <Paper className="surface-panel fade-in-up stagger-2" sx={{ p: { xs: 1.6, md: 2.1 }, borderRadius: '30px' }}>
                <Stack spacing={1.6}>
                    <Stack direction={{ xs: 'column', xl: 'row' }} justifyContent="space-between" spacing={1.2}>
                        <Stack direction="row" flexWrap="wrap" gap={0.8}>
                            {viewOptions.map((option) => (
                                <Button
                                    key={option.key}
                                    color="secondary"
                                    onClick={() => setViewMode(option.key)}
                                    startIcon={option.icon}
                                    variant={viewMode === option.key ? 'contained' : 'outlined'}
                                >
                                    {option.label}
                                </Button>
                            ))}
                        </Stack>
                        <Stack direction="row" flexWrap="wrap" gap={0.8}>
                            <Chip
                                icon={<FolderRoundedIcon />}
                                label={`${projectOptions.length} project${projectOptions.length === 1 ? '' : 's'}`}
                                size="small"
                                sx={{ height: 32, '& .MuiChip-label': { px: 1.2 } }}
                                variant="outlined"
                            />
                            <Button
                                onClick={() => setIsProjectsDialogOpen(true)}
                                startIcon={<SettingsRoundedIcon />}
                                size="small"
                                sx={{ minHeight: 32, px: 1.4, whiteSpace: 'nowrap' }}
                                variant="outlined"
                            >
                                Manage
                            </Button>
                        </Stack>
                    </Stack>

                    <Stack direction="row" flexWrap="wrap" gap={0.8} alignItems="center">
                        <FormControl size="small" sx={{ minWidth: 180 }}>
                            <InputLabel id="status-select-label">Status</InputLabel>
                            <Select
                                labelId="status-select-label"
                                value={statusFilter}
                                label="Status"
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <MenuItem value="all">All ({statusCounts.all})</MenuItem>
                                <MenuItem value="active">In focus ({statusCounts.active})</MenuItem>
                                <MenuItem value="overdue">Overdue ({statusCounts.overdue})</MenuItem>
                                <MenuItem value="done">Done ({statusCounts.done})</MenuItem>
                            </Select>
                        </FormControl>

                        <FormControl size="small" sx={{ minWidth: 220 }}>
                            <InputLabel id="project-select-label">Project</InputLabel>
                            <Select
                                labelId="project-select-label"
                                value={projectFilter}
                                label="Project"
                                onChange={(e) => setProjectFilter(e.target.value)}
                            >
                                <MenuItem value="all">All projects ({totalTodos})</MenuItem>
                                {projectOptions.map((project) => (
                                    <MenuItem key={project._id || project.name} value={project.name}>
                                        {`${project.name} (${project.tasksCount})`}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <FormControl size="small" sx={{ minWidth: 160 }}>
                            <InputLabel id="priority-select-label">Priority</InputLabel>
                            <Select
                                labelId="priority-select-label"
                                value={priorityFilter}
                                label="Priority"
                                onChange={(e) => setPriorityFilter(e.target.value)}
                            >
                                <MenuItem value="all">All priorities ({priorityCounts.all})</MenuItem>
                                <MenuItem value="high">High ({priorityCounts.high})</MenuItem>
                                <MenuItem value="medium">Medium ({priorityCounts.medium})</MenuItem>
                                <MenuItem value="low">Low ({priorityCounts.low})</MenuItem>
                            </Select>
                        </FormControl>
                    </Stack>



                    {viewMode === 'list' && (
                        <TodoTable
                            apiRef={apiRef}
                            dataToShow={filteredTodos}
                            deleteTodo={deleteTodo}
                            editDueDate={editDueDate}
                            editPriority={editPriority}
                            editProject={editProject}
                            editStatus={editStatus}
                            editText={editText}
                            isLoading={isTodosLoading}
                            projects={projectOptions}
                            setCurrentPaginationModel={setCurrentPaginationModel}
                            setSelectedRows={setSelectedRows}
                        />
                    )}

                    {viewMode === 'board' && (
                        <TodoBoard
                            todos={filteredTodos}
                            deleteTodo={deleteTodo}
                            editStatus={editStatus}
                            editText={editText}
                        />
                    )}

                    {viewMode === 'calendar' && (
                        <TodoCalendar
                            todos={filteredTodos}
                            deleteTodo={deleteTodo}
                            editStatus={editStatus}
                            editText={editText}
                        />
                    )}
                </Stack>
            </Paper>

            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', xl: '1fr 1fr' },
                    gap: 1.6,
                }}
            >
                <Paper
                    className="surface-panel fade-in-up stagger-3"
                    sx={{
                        p: { xs: 1.8, md: 2.1 },
                        borderRadius: '28px',
                        borderColor: overdueSpotlightTodos.length ? 'rgba(211, 47, 47, 0.18)' : undefined,
                    }}
                >
                    <Stack spacing={1.3}>
                        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={1}>
                            <Box>
                                <Typography variant="h4">Needs attention</Typography>
                                <Typography sx={{ color: 'text.secondary', mt: 0.35 }}>
                                    Overdue tasks stay pinned here, but they no longer block the task view above.
                                </Typography>
                            </Box>
                            <Button
                                color="error"
                                onClick={() => {
                                    setStatusFilter('overdue');
                                    setProjectFilter('all');
                                    setViewMode('list');
                                }}
                                size="small"
                                sx={{ minHeight: 34, px: 2, whiteSpace: 'nowrap', alignSelf: { md: 'flex-start' } }}
                                variant={statusFilter === 'overdue' ? 'contained' : 'outlined'}
                            >
                                Show overdue
                            </Button>
                        </Stack>

                        {overdueSpotlightTodos.length ? (
                            <Box
                                sx={{
                                    display: 'grid',
                                    gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' },
                                    gap: 1,
                                }}
                            >
                                {overdueSpotlightTodos.map((todo) => (
                                    <Paper
                                        key={todo._id}
                                        sx={{
                                            p: 1.2,
                                            borderRadius: '18px',
                                            border: '1px solid rgba(211, 47, 47, 0.18)',
                                            background: 'rgba(255, 241, 239, 0.94)',
                                        }}
                                        variant="outlined"
                                    >
                                        <Stack spacing={0.7}>
                                            <Stack direction="row" flexWrap="wrap" gap={0.7}>
                                                <ProjectChip project={todo.project} />
                                                <Chip color="error" label={todo.dueDate} size="small" variant="filled" />
                                            </Stack>
                                            <Typography sx={{ fontWeight: 700, lineHeight: 1.45 }}>
                                                {todo.todo}
                                            </Typography>
                                        </Stack>
                                    </Paper>
                                ))}
                            </Box>
                        ) : (
                            <Typography sx={{ color: 'text.secondary' }}>
                                No overdue tasks are visible right now.
                            </Typography>
                        )}
                    </Stack>
                </Paper>

                <Paper className="surface-panel fade-in-up stagger-4" sx={{ p: { xs: 1.8, md: 2.1 }, borderRadius: '28px' }}>
                    <Stack spacing={1.3}>
                        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={1}>
                            <Box>
                                <Typography variant="h4">Project buckets</Typography>
                                <Typography sx={{ color: 'text.secondary', mt: 0.35 }}>
                                    Keep projects visible without letting their controls push the task view down the page.
                                </Typography>
                            </Box>
                            <Button
                                onClick={() => setIsProjectsDialogOpen(true)}
                                sx={{
                                    minHeight: 36,
                                    minWidth: { xs: '100%', md: 156 },
                                    px: 1.8,
                                    whiteSpace: 'nowrap',
                                    alignSelf: { md: 'flex-start' },
                                    flexShrink: 0,
                                }}
                                variant="outlined"
                            >
                                Manage projects
                            </Button>
                        </Stack>

                        <Box
                            sx={{
                                display: 'grid',
                                gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' },
                                gap: 1,
                            }}
                        >
                            <Paper
                                onClick={() => setProjectFilter('all')}
                                sx={{
                                    p: 1.2,
                                    borderRadius: '18px',
                                    border: projectFilter === 'all'
                                        ? '1px solid rgba(217, 103, 77, 0.34)'
                                        : '1px solid rgba(31, 64, 87, 0.1)',
                                    background: projectFilter === 'all'
                                        ? 'rgba(255, 244, 239, 0.96)'
                                        : 'rgba(255, 255, 255, 0.72)',
                                    cursor: 'pointer',
                                }}
                                variant="outlined"
                            >
                                <Stack spacing={0.65}>
                                    <Stack alignItems="center" direction="row" justifyContent="space-between" spacing={1}>
                                        <Typography sx={{ fontWeight: 800 }}>
                                            All projects
                                        </Typography>
                                        <Chip
                                            color={projectFilter === 'all' ? 'secondary' : 'default'}
                                            label={totalTodos}
                                            size="small"
                                            variant={projectFilter === 'all' ? 'filled' : 'outlined'}
                                        />
                                    </Stack>
                                    <Typography sx={{ color: 'text.secondary', fontSize: '0.92rem' }}>
                                        See everything in one place.
                                    </Typography>
                                </Stack>
                            </Paper>

                            {projectOptions.map((project) => {
                                const isSelected = projectFilter === project.name;

                                return (
                                    <Paper
                                        key={project._id || project.name}
                                        onClick={() => setProjectFilter(project.name)}
                                        sx={{
                                            p: 1.2,
                                            borderRadius: '18px',
                                            border: isSelected
                                                ? '1px solid rgba(217, 103, 77, 0.34)'
                                                : '1px solid rgba(31, 64, 87, 0.1)',
                                            background: isSelected
                                                ? 'rgba(255, 247, 243, 0.96)'
                                                : 'rgba(255, 255, 255, 0.72)',
                                            cursor: 'pointer',
                                        }}
                                        variant="outlined"
                                    >
                                        <Stack spacing={0.65}>
                                            <Stack alignItems="center" direction="row" justifyContent="space-between" spacing={1}>
                                                <ProjectChip project={project.name} size="medium" variant={isSelected ? 'filled' : 'outlined'} />
                                                <Chip
                                                    color={isSelected ? 'secondary' : 'default'}
                                                    label={project.tasksCount}
                                                    size="small"
                                                    variant={isSelected ? 'filled' : 'outlined'}
                                                />
                                            </Stack>
                                            <Typography sx={{ color: 'text.secondary', fontSize: '0.92rem' }}>
                                                {project.isDefault
                                                    ? 'Fallback project for uncategorized work.'
                                                    : project.tasksCount
                                                        ? 'Filter the workspace to this bucket.'
                                                        : 'Empty for now, ready for the next task.'}
                                            </Typography>
                                        </Stack>
                                    </Paper>
                                );
                            })}
                        </Box>
                    </Stack>
                </Paper>
            </Box>

            <EditTodoDialog
                closeEditTodoDialog={closeEditTodoDialog}
                handleEditDialogSubmit={handleEditDialogSubmit}
                open={isEditDialogOpen}
                params={params}
                projects={projectOptions}
                setParams={setParams}
            />
            <ManageProjectsDialog
                createProject={createProject}
                deleteProject={deleteProject}
                onClose={() => setIsProjectsDialogOpen(false)}
                open={isProjectsDialogOpen}
                projects={projectOptions}
                updateProject={updateProject}
            />
        </Box>
    ) : (
        <LoginPage />
    );
}

export default TodoListPage;
