import { React, useEffect, useState, useRef } from "react";
import axios from "axios";
import { useGridApiRef } from "@mui/x-data-grid";
import { toast } from 'react-toastify';
import { useAuth0 } from "@auth0/auth0-react";
import AddToDoForm from "../components/addTodoForm";
import TodoTable from "../components/todoTable";
import LoginPage from "./loginPage";

function TodoListPage() {

    const fetchAmountRef = useRef(30);
    const baseUrl = import.meta.env.VITE_APP_BASE_URL;
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
            if (confirm('Are you sure you want to delete all the todos?')) {
                const response = await axios.delete(`${baseUrl}/cleanList`, config);
                if (response.status === 204) {
                    apiRef.current.setPage(0);
                    setDataToShow([]);
                    notifySuceess("The clean operation was completed successfully");
                }
                else {
                    notifyError("Could not clean the list");
                }
            } else {
                notifyWarning("Clean operation canceled");
            }
        } catch (e) {
            console.log(e.message);
        }

    }

    const addTodo = async (todo, completed) => {
        try {
            const response = await axios.post(`${baseUrl}/todos`, { value: todo, completed: completed }, config);
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
            <div className="small-margin-top form-border">
                <div>
                    <label htmlFor="fetch">Choose an amount to fetch: </label>
                    <select ref={fetchAmountRef} name="fetch" id="fetch" defaultValue={30}>
                        {[1, 5, 10, 20, 30, 100].map(x => <option key={x} value={x}>{x}</option>)}
                    </select>
                </div>
                <button className="margin" onClick={fetchTodos}>Fetch</button>
                <button className="margin" onClick={cleanList} disabled={dataToShow.length < 1}>Clean list</button>
            </div>
            <AddToDoForm addTodo={addTodo} />
        </>
    ) : (
        <LoginPage />
    );

}

export default TodoListPage;