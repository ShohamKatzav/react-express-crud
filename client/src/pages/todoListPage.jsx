import { React, useEffect, useState, useRef } from "react";
import axios from "axios";
import { useGridApiRef } from "@mui/x-data-grid";
import { toast } from 'react-toastify';
import { useAuth0 } from "@auth0/auth0-react";
import AddToDoDialog from "../dialogs/addTodoDialog";
import TodoTable from "../components/todoTable";
import LoginPage from "./loginPage";
import useGetButtonsSize from "../hooks/useGetButtonsSize";
import CleanTodosDialog from "../dialogs/cleanTodosDialog";
import EditTodoDialog from "../dialogs/editTodoDialog";
import FetchTodoDialog from "../dialogs/fetchTodoDialog";

import Button from '@mui/material/Button';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircle from "@mui/icons-material/CheckCircle";
import Cancel from "@mui/icons-material/Cancel";

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
    const fetchAmountRef = useRef(30);

    const { isAuthenticated, getAccessTokenSilently, isLoading } = useAuth0();

    const [selectedRows, setSelectedRows] = useState([]);
    const buttonSize = useGetButtonsSize();

    const notifySuceess = (text) => {
        toast.dismiss()
        toast.success(text);
    }
    const notifyWarning = (text) => {
        toast.dismiss()
        toast.warning(text);
    }
    const notifyError = (text) => {
        toast.dismiss()
        toast.error(text);
    }

    const getData = async () => {
        if (isAuthenticated) {
            try {
                const accessToken = await getAccessTokenSilently();
                const newConfig = {
                    headers: { Authorization: `Bearer ${accessToken}` }
                };
                setConfig(newConfig);
                const response = await axios.get(`${baseUrl}/todo`, newConfig);
                const data = response.data;
                setDataToShow(data);

            } catch (e) {
                console.log(e.message);
            }

        }
    }

    useEffect(() => {
        if (isAuthenticated)
            getData();
    }, [isAuthenticated]);

    const fetchTodos = async () => {
        try {
            const response = await axios.post(`${baseUrl}/fetchTodos`, { fetchAmount: fetchAmountRef.current.value }, config);
            if (response.status === 200) {
                const newData = [...dataToShow, ...response.data]
                setDataToShow(newData);
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

    }

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
                setDataToShow(current => [...current, response.data]);
                notifySuceess("Todo added successfully");
            }
            else {
                notifyError("Max list size is 150");
            }
        } catch (e) {
            console.log(e.message);
        }
    }

    const deleteTodo = async (todo_Id) => {
        try {
            await axios.delete(`${baseUrl}/todo`, { headers: { Authorization: config.headers.Authorization }, data: { id: todo_Id } })
            setDataToShow(current => current.filter(x => x._id !== todo_Id));
            notifySuceess("Todo deleted successfully");

        } catch (e) {
            console.log(e.message);
        }
    }

    // Check boundaries on delete and move to the last new page on add
    useEffect(() => {
        if (dataToShow.length) {
            if (!isDataRendered)
                setIsDataRendered(true);
            else {
                const lastPage = Math.ceil(dataToShow.length / currentPaginationModel.pageSize) - 1;
                if (currentPaginationModel.page > lastPage || currentPaginationModel.page < lastPage && todoAdded) {
                    apiRef.current.setPage(lastPage);
                    setTodoAdded(false);
                }
            }
        }
    }, [dataToShow, isDataRendered]);


    const openEditTodoDialog = () => {
        setIsEditDialogOpen(true);
    };
    const closeEditTodoDialog = () => {
        notifyWarning("Edit operation canceled");
        setIsEditDialogOpen(false);
    };
    const handleEditDialogSubmit = (e) => {
        e.preventDefault();
        const index = dataToShow.findIndex(c => c._id === params.id);
        sendPutRequestAndUpdateState(params, index, "/todo/editText");
        notifySuceess("Todo edited successfully");
        setIsEditDialogOpen(false);
    };

    const editText = (todo_Id) => {
        const updatedParams = { id: todo_Id, todo: (dataToShow.find(todo => todo._id === todo_Id)).todo };
        setParams(updatedParams);
        openEditTodoDialog();
    }
    const editStatus = (todo_Id) => {
        const index = dataToShow.findIndex(c => c._id === todo_Id);
        var params = { id: todo_Id, completed: !(dataToShow.find(c => c._id === todo_Id).completed) };
        sendPutRequestAndUpdateState(params, index, "/todo/editStatus");
        notifySuceess("Todo status changed");
    }

    const sendPutRequestAndUpdateState = async (params, index, endPoint) => {
        try {
            const response = await axios.put(baseUrl + endPoint, params, config);
            const newData = [...dataToShow];
            newData[index] = response.data;
            setDataToShow(newData);
        } catch (e) {
            console.log(e.message);
        }
    }

    const deleteSelected = async () => {
        try {
            await axios.delete(`${baseUrl}/delete-selected`, {
                headers: { Authorization: config.headers.Authorization }, data: { ids: selectedRows }
            })
            setDataToShow(current => current.filter(x => !selectedRows.includes(x._id)));
            notifySuceess("Todos deleted successfully");

        } catch (e) {
            console.log(e.message);
        }
    }
    const changeSelectedStatus = async (newStatus) => {
        const indexes = [];
        for (var i = 0; i < selectedRows.length; i++) {
            const index = dataToShow.findIndex(c => selectedRows[i].includes(c._id));
            if (dataToShow[index].completed !== newStatus ) indexes.push(index);
        }
        if (indexes.length === 0){
            notifyWarning("Nothing to change");
            return;
        }
        var params = { ids: selectedRows, completed: newStatus };
        try {
            const response = await axios.put(`${baseUrl}/change-selected-status`, params, config);
            const newData = [...dataToShow];
            indexes.forEach((index) =>{
                newData[index] = response.data.find(x => x._id == newData[index]._id)
            });
            setDataToShow(newData);
        } catch (e) {
            console.log(e.message);
        }
        notifySuceess("Todos status changed");
    }

    if (isLoading)
        return <h1>Loading...</h1>

    return isAuthenticated ? (
        <>
            <h1>Manage Your Todos Here</h1>
            <TodoTable
                dataToShow={dataToShow}
                deleteTodo={deleteTodo}
                editText={editText}
                editStatus={editStatus}
                setCurrentPaginationModel={setCurrentPaginationModel}
                apiRef={apiRef}
                setSelectedRows={setSelectedRows}
            />
            <div className="small-margin-top"></div>
            <AddToDoDialog
                addTodo={addTodo}
                buttonSize={buttonSize}
                notifyError={notifyError}
                notifyWarning={notifyWarning}
            />
            <FetchTodoDialog
                fetchTodos={fetchTodos}
                fetchAmountRef={fetchAmountRef}
                buttonSize={buttonSize}
                notifyWarning={notifyWarning}
            />
            <CleanTodosDialog
                cleanList={cleanList}
                dataToShow={dataToShow}
                buttonSize={buttonSize}
                notifyWarning={notifyWarning}
            />
            {
                isEditDialogOpen &&
                <EditTodoDialog
                    handleEditDialogSubmit={handleEditDialogSubmit}
                    closeEditTodoDialog={closeEditTodoDialog}
                    params={params}
                    setParams={setParams}
                />
            }
            <br/>
            <Button onClick={() => deleteSelected()}
                disabled={selectedRows.length < 1}
                variant="outlined" size={buttonSize}
                startIcon={<DeleteIcon />}>
                Selected
            </Button>
            <Button onClick={() => changeSelectedStatus(true)}
                disabled={selectedRows.length < 1}
                variant="outlined" size={buttonSize}
                endIcon={<CheckCircle />}>
                Mark Selected as 
            </Button>
            <Button onClick={() => changeSelectedStatus(false)}
                disabled={selectedRows.length < 1}
                variant="outlined" size={buttonSize}
                endIcon={<Cancel />}>
                Mark Selected as 
            </Button>
        </>
    ) : (
        <LoginPage />
    );

}

export default TodoListPage;