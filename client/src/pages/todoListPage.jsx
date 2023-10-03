import { React, useEffect, useState } from "react";
import axios from "axios";
import { useGridApiRef } from "@mui/x-data-grid";
import { toast } from 'react-toastify';
import AddToDoForm from "../components/addTodoForm";
import TodoTable from "../components/todoTable";
import { useAuth0 } from "@auth0/auth0-react";

function TodoListPage() {

    const baseUrl = "/api/v1";
    const apiRef = useGridApiRef();
    const [currentPaginationModel, setCurrentPaginationModel] = useState({ page: 0, pageSize: 5 });
    const [dataToShow, setDataToShow] = useState([]);
    const [isDataRendered, setIsDataRendered] = useState(true);
    const [todoAdded, setTodoAdded] = useState(false);
    const [config, setConfig] = useState(null);


    const { isAuthenticated, getAccessTokenSilently, isLoading } = useAuth0();

    const notifySuceess = (text) => {
        toast.dismiss()
        toast.success(text);
    }
    const notifyError = (text) => {
        toast.dismiss()
        toast.error(text);
    }

    const getData = async () => {
        if (isAuthenticated) {
            try {
                const accessToken = await getAccessTokenSilently({
                    authorizationParams: {
                        audience: import.meta.env.VITE_APP_AUTH0_API_AUDIENCE,
                        scope: "read:todos",
                    },
                });
                const newConfig = {
                    headers: { Authorization: `Bearer ${accessToken}` }
                };
                setConfig(newConfig);
                const response = await axios.get(`${baseUrl}/todos`, newConfig);
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
            const response = await axios.get(`${baseUrl}/fetchTodos`, config);
            if (response.status === 200) {
                const newData = [...dataToShow, ...response.data]
                setDataToShow(newData);
                setTodoAdded(true);
                setIsDataRendered(false);
                notifySuceess("The fetch operation was completed successfully");
            }
            else {
                notifyError("No more todos available to fetch");
            }
        } catch (e) {
            console.log(e.message);
        }

    }
    const cleanList = async () => {
        try {
            const response = await axios.delete(`${baseUrl}/cleanList`, config);
            if (response.status === 204) {
                setDataToShow([]);
                notifySuceess("The clean operation was completed successfully");
            }
            else {
                notifyError("Could not clean list");
            }
        } catch (e) {
            console.log(e.message);
        }

    }

    const addTodo = async (todo, completed) => {
        try {
            const response = await axios.post(`${baseUrl}/todos`, { value: todo, completed: completed }, config);
            setTodoAdded(true);
            setIsDataRendered(false);
            setDataToShow(current => [...current, response.data]);
            notifySuceess("Todo added successfully");
        } catch (e) {
            console.log(e.message);
        }

    }

    const deleteTodo = async (todo_Id) => {
        try {
            await axios.delete(`${baseUrl}/todos`, { headers: { Authorization: config.headers.Authorization }, data: { id: todo_Id } })
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
                setIsDataRendered(current => !current);
            else {
                const lastPage = Math.ceil(dataToShow.length / currentPaginationModel.pageSize) - 1;
                if (currentPaginationModel.page > lastPage || currentPaginationModel.page < lastPage && todoAdded) {
                    apiRef.current.setPage(lastPage);
                    setTodoAdded(false);
                }
            }
        }
    }, [dataToShow, isDataRendered]);

    const editText = (todo_Id) => {
        const index = dataToShow.findIndex(c => c._id === todo_Id);
        const newTextValue = prompt('Please enter new todo value', dataToShow[index].todo);
        var params = { id: todo_Id, todo: newTextValue };
        sendPutRequestAndUpdateState(params, index, "/editText");
        notifySuceess("Todo edited successfully");
    }
    const editStatus = (todo_Id) => {
        const index = dataToShow.findIndex(c => c._id === todo_Id);
        var params = { id: todo_Id, completed: !(dataToShow.find(c => c._id === todo_Id).completed) };
        sendPutRequestAndUpdateState(params, index, "/editStatus");
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
            />
            <div className="small-margin-top">
                <button onClick={fetchTodos}>Fetch</button>
                <button onClick={cleanList}>Clean list</button>
            </div>
            <AddToDoForm addTodo={addTodo} />
        </>
    ) : (
        <h1>To view your tasks, please log in.</h1>
    );

}

export default TodoListPage;