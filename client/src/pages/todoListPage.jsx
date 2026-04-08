import { useEffect, useState } from "react";
import axios from "axios";
import { useGridApiRef } from "@mui/x-data-grid";
import { toast } from 'react-toastify';
import { useAuth0 } from "@auth0/auth0-react";
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import DeleteSweepRoundedIcon from '@mui/icons-material/DeleteSweepRounded';
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import RadioButtonUncheckedRoundedIcon from "@mui/icons-material/RadioButtonUncheckedRounded";
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import ListAltRoundedIcon from '@mui/icons-material/ListAltRounded';
import TaskAltRoundedIcon from '@mui/icons-material/TaskAltRounded';
import AddToDoDialog from "../dialogs/addTodoDialog";
import TodoTable from "../components/todoTable";
import LoginPage from "./loginPage";
import CleanTodosDialog from "../dialogs/cleanTodosDialog";
import EditTodoDialog from "../dialogs/editTodoDialog";
import FetchTodoDialog from "../dialogs/fetchTodoDialog";

function TodoListPage() {

    const baseUrl = import.meta.env.VITE_APP_BASE_URL;
    const apiRef = useGridApiRef();
    const [currentPaginationModel, setCurrentPaginationModel] = useState({ page: 0, pageSize: 5 });
    const [dataToShow, setDataToShow] = useState([]);
    const [isDataRendered, setIsDataRendered] = useState(true);
    const [todoAdded, setTodoAdded] = useState(false);
    const [config, setConfig] = useState(null);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [params, setParams] = useState({});
    const [selectedRows, setSelectedRows] = useState([]);
    const [isTodosLoading, setIsTodosLoading] = useState(false);

    const { isAuthenticated, getAccessTokenSilently, isLoading } = useAuth0();

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

    const getData = async () => {
        if (isAuthenticated) {
            setIsTodosLoading(true);
            try {
                const accessToken = await getAccessTokenSilently();
                const newConfig = {
                    headers: { Authorization: `Bearer ${accessToken}` }
                };
                setConfig(newConfig);
                const response = await axios.get(`${baseUrl}/todo`, newConfig);
                setDataToShow(response.data);
            } catch (e) {
                console.log(e.message);
            } finally {
                setIsTodosLoading(false);
            }
        }
    };

    useEffect(() => {
        if (isAuthenticated) {
            getData();
        }
    }, [isAuthenticated]);

    const fetchTodos = async (amount) => {
        try {
            const response = await axios.post(`${baseUrl}/fetchTodos`, { fetchAmount: amount }, config);
            if (response.status === 200) {
                setDataToShow((current) => [...current, ...response.data]);
                setTodoAdded(true);
                setIsDataRendered(false);
                notifySuceess("The fetch operation was completed successfully");
            }
            else {
                notifyError("Max list size is 150");
            }
        } catch (e) {
            console.log(e.message);
        }
    };

    const cleanList = async () => {
        try {
            const response = await axios.delete(`${baseUrl}/cleanList`, config);
            if (response.status === 204) {
                apiRef.current.setPage(0);
                setDataToShow([]);
                notifySuceess("The clean operation was completed successfully");
            }
            else {
                notifyError("Could not clean the list");
            }
        } catch (e) {
            console.log(e.message);
        }
    };

    const addTodo = async (todo, completed) => {
        try {
            const response = await axios.post(`${baseUrl}/todo`, { value: todo, completed: completed }, config);
            if (response.status === 200) {
                setTodoAdded(true);
                setIsDataRendered(false);
                setDataToShow((current) => [...current, response.data]);
                notifySuceess("Todo added successfully");
            }
            else {
                notifyError("Max list size is 150");
            }
        } catch (e) {
            console.log(e.message);
        }
    };

    const deleteTodo = async (todo_Id) => {
        try {
            await axios.delete(`${baseUrl}/todo`, { headers: { Authorization: config.headers.Authorization }, data: { id: todo_Id } });
            setDataToShow((current) => current.filter((item) => item._id !== todo_Id));
            notifySuceess("Todo deleted successfully");
        } catch (e) {
            console.log(e.message);
        }
    };

    // Keep pagination in bounds and move to the last page after creating a task.
    useEffect(() => {
        if (dataToShow.length) {
            if (!isDataRendered) {
                setIsDataRendered(true);
            }
            else {
                const lastPage = Math.ceil(dataToShow.length / currentPaginationModel.pageSize) - 1;
                if (currentPaginationModel.page > lastPage || (currentPaginationModel.page < lastPage && todoAdded)) {
                    apiRef.current.setPage(lastPage);
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
        const index = dataToShow.findIndex((todo) => todo._id === params.id);
        await sendPutRequestAndUpdateState(params, index, "/todo/editText");
        notifySuceess("Todo edited successfully");
        setIsEditDialogOpen(false);
    };

    const editText = (todo_Id) => {
        const todoToEdit = dataToShow.find((todo) => todo._id === todo_Id);
        setParams({ id: todo_Id, todo: todoToEdit.todo });
        openEditTodoDialog();
    };
    const editStatus = (todo_Id) => {
        const index = dataToShow.findIndex((todo) => todo._id === todo_Id);
        const nextParams = { id: todo_Id, completed: !dataToShow.find((todo) => todo._id === todo_Id).completed };
        sendPutRequestAndUpdateState(nextParams, index, "/todo/editStatus");
        notifySuceess("Todo status changed");
    };

    const sendPutRequestAndUpdateState = async (requestParams, index, endPoint) => {
        try {
            const response = await axios.put(baseUrl + endPoint, requestParams, config);
            setDataToShow((current) => {
                const newData = [...current];
                newData[index] = response.data;
                return newData;
            });
        } catch (e) {
            console.log(e.message);
        }
    };

    const deleteSelected = async () => {
        try {
            await axios.delete(`${baseUrl}/delete-selected`, {
                headers: { Authorization: config.headers.Authorization }, data: { ids: selectedRows }
            });
            setDataToShow((current) => current.filter((todo) => !selectedRows.includes(todo._id)));
            notifySuceess("Todos deleted successfully");
        } catch (e) {
            console.log(e.message);
        }
    };
    const changeSelectedStatus = async (newStatus) => {
        const indexes = [];
        for (let i = 0; i < selectedRows.length; i++) {
            const index = dataToShow.findIndex((todo) => selectedRows[i] === todo._id);
            if (index !== -1 && dataToShow[index].completed !== newStatus) {
                indexes.push(index);
            }
        }
        if (indexes.length === 0) {
            notifyWarning("Nothing to change");
            return;
        }

        const requestParams = { ids: selectedRows, completed: newStatus };
        try {
            const response = await axios.put(`${baseUrl}/change-selected-status`, requestParams, config);
            setDataToShow((current) => {
                const newData = [...current];
                indexes.forEach((index) => {
                    newData[index] = response.data.find((todo) => todo._id === newData[index]._id);
                });
                return newData;
            });
        } catch (e) {
            console.log(e.message);
        }
        notifySuceess("Todos status changed");
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

    const totalTodos = dataToShow.length;
    const completedTodos = dataToShow.filter((todo) => todo.completed).length;
    const remainingTodos = totalTodos - completedTodos;
    const completionRate = totalTodos ? `${Math.round((completedTodos / totalTodos) * 100)}%` : '0%';

    const stats = [
        {
            label: 'Tasks in play',
            value: totalTodos,
            helper: 'Everything currently on your list',
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
            label: 'Completion rate',
            value: completionRate,
            helper: `${remainingTodos} still in focus`,
            accent: 'rgba(216, 164, 61, 0.15)',
            icon: <AutoAwesomeRoundedIcon sx={{ color: '#d8a43d' }} />,
        },
    ];

    return isAuthenticated ? (
        <Box className="page-shell">
            <Paper className="surface-panel fade-in-up" sx={{ p: { xs: 2.2, md: 3.5 }, borderRadius: '36px' }}>
                <Stack direction={{ xs: 'column', xl: 'row' }} justifyContent="space-between" spacing={3}>
                    <Box sx={{ maxWidth: 690 }}>
                        <p className="eyebrow">Daily command center</p>
                        <Typography className="page-title" sx={{ fontSize: { xs: '2.4rem', md: '4rem' } }} variant="h1">
                            Manage your tasks with more clarity and less friction.
                        </Typography>
                        <Typography className="page-subtitle" sx={{ mt: 1.4 }}>
                            Add new work, import sample items, batch-update progress, and keep your momentum visible from one bright workspace.
                        </Typography>
                        <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mt: 2.4 }}>
                            <Chip label={`${selectedRows.length} selected`} variant="outlined" />
                            <Chip color="secondary" label={`${remainingTodos} in focus`} variant="outlined" />
                            <Chip color="success" label={`${completedTodos} completed`} variant="outlined" />
                        </Stack>
                    </Box>

                    <Stack direction={{ xs: 'column', sm: 'row', xl: 'column' }} spacing={1.4} sx={{ minWidth: { xl: 280 } }}>
                        {stats.map((stat, index) => (
                            <Paper
                                key={stat.label}
                                className={`fade-in-up stagger-${index + 1}`}
                                sx={{
                                    p: 2,
                                    borderRadius: '24px',
                                    border: '1px solid rgba(31, 64, 87, 0.08)',
                                    background: stat.accent,
                                    minWidth: { sm: 190, xl: 'auto' },
                                }}
                                variant="outlined"
                            >
                                <Stack direction="row" spacing={1.4}>
                                    <Box
                                        sx={{
                                            width: 48,
                                            height: 48,
                                            borderRadius: '18px',
                                            display: 'grid',
                                            placeItems: 'center',
                                            background: 'rgba(255, 250, 244, 0.72)',
                                            flexShrink: 0,
                                        }}
                                    >
                                        {stat.icon}
                                    </Box>
                                    <Box>
                                        <Typography sx={{ color: 'text.secondary', fontSize: '0.84rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                                            {stat.label}
                                        </Typography>
                                        <Typography sx={{ fontSize: '1.7rem', fontWeight: 800, lineHeight: 1.1, mt: 0.35 }}>
                                            {stat.value}
                                        </Typography>
                                        <Typography sx={{ color: 'text.secondary', fontSize: '0.9rem', mt: 0.3 }}>
                                            {stat.helper}
                                        </Typography>
                                    </Box>
                                </Stack>
                            </Paper>
                        ))}
                    </Stack>
                </Stack>
            </Paper>

            <Paper className="surface-panel fade-in-up stagger-2" sx={{ p: { xs: 2, md: 3 }, borderRadius: '32px' }}>
                <Stack spacing={2.3}>
                    <Stack direction={{ xs: 'column', lg: 'row' }} justifyContent="space-between" spacing={2}>
                        <Box>
                            <Typography variant="h3">Task studio</Typography>
                            <Typography sx={{ color: 'text.secondary', mt: 0.6 }}>
                                Shape the list from here, then use the grid below to review or batch-edit tasks.
                            </Typography>
                        </Box>
                        <Stack direction="row" flexWrap="wrap" gap={1}>
                            <AddToDoDialog
                                addTodo={addTodo}
                                notifyError={notifyError}
                                notifyWarning={notifyWarning}
                            />
                            <FetchTodoDialog
                                fetchTodos={fetchTodos}
                                notifyWarning={notifyWarning}
                            />
                            <CleanTodosDialog
                                cleanList={cleanList}
                                dataToShow={dataToShow}
                                notifyWarning={notifyWarning}
                            />
                            <Button
                                color="error"
                                disabled={selectedRows.length < 1}
                                onClick={() => deleteSelected()}
                                startIcon={<DeleteSweepRoundedIcon />}
                                variant="outlined"
                            >
                                Delete selected
                            </Button>
                            <Button
                                color="success"
                                disabled={selectedRows.length < 1}
                                onClick={() => changeSelectedStatus(true)}
                                startIcon={<CheckCircleRoundedIcon />}
                                variant="outlined"
                            >
                                Mark selected done
                            </Button>
                            <Button
                                color="warning"
                                disabled={selectedRows.length < 1}
                                onClick={() => changeSelectedStatus(false)}
                                startIcon={<RadioButtonUncheckedRoundedIcon />}
                                variant="outlined"
                            >
                                Mark selected active
                            </Button>
                        </Stack>
                    </Stack>

                    <TodoTable
                        apiRef={apiRef}
                        dataToShow={dataToShow}
                        deleteTodo={deleteTodo}
                        editStatus={editStatus}
                        editText={editText}
                        isLoading={isTodosLoading}
                        setCurrentPaginationModel={setCurrentPaginationModel}
                        setSelectedRows={setSelectedRows}
                    />
                </Stack>
            </Paper>

            <EditTodoDialog
                closeEditTodoDialog={closeEditTodoDialog}
                handleEditDialogSubmit={handleEditDialogSubmit}
                open={isEditDialogOpen}
                params={params}
                setParams={setParams}
            />
        </Box>
    ) : (
        <LoginPage />
    );

}

export default TodoListPage;
