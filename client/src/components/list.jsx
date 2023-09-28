import { React, useEffect, useState, useRef } from "react";
import axios from "axios";
import IconButton from "@mui/material/IconButton";
import { DataGrid, useGridApiRef } from "@mui/x-data-grid";
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import { toast } from 'react-toastify';

function List() {

    const baseUrl = "/api/v1";
    const apiRef = useGridApiRef();
    const [currentPaginationModel, setCurrentPaginationModel] = useState({ page: 0, pageSize: 5 });
    const [dataToShow, setDataToShow] = useState([]);
    const [isDataRendered, setIsDataRendered] = useState(true);
    const [todoAdded, setTodoAdded] = useState(false);
    const newTodoInput = useRef("");
    const newTodoCheckbox = useRef(false);
    const columns =
        [
            { field: '_id', headerName: 'ID', width: 100, valueGetter: (params) => params.row._id.slice(-6) },
            { field: 'todo', headerName: 'To Do', width: 300 },
            { field: 'completed', headerName: 'Status', type: 'boolean', width: 60 },
            {
                field: "delete",
                headerName: "Delete",
                sortable: false,
                renderCell: (params) => {
                    const onClick = (e) => {
                        e.stopPropagation(); // don't select this row after clicking
                        const thisRow = returnRowByParams(params);
                        return deleteTodo(thisRow._id);
                    };

                    return <IconButton onClick={onClick} color="primary">
                        <DeleteIcon />
                    </IconButton>
                }
            },
            {
                field: "changeStatus",
                headerName: "Change Status",
                width: 120,
                sortable: false,
                renderCell: (params) => {
                    const onClick = (e) => {
                        e.stopPropagation();
                        const thisRow = returnRowByParams(params);
                        return editStatus(thisRow._id);
                    };

                    return <IconButton onClick={onClick} color="primary">
                        <CheckBoxOutlineBlankIcon />
                    </IconButton>
                }
            },
            {
                field: "edit",
                headerName: "Edit",
                sortable: false,
                renderCell: (params) => {
                    const onClick = (e) => {
                        e.stopPropagation();
                        const thisRow = returnRowByParams(params);
                        return editText(thisRow._id);
                    };

                    return <IconButton onClick={onClick} color="primary">
                        <EditIcon />
                    </IconButton>
                }
            },

        ]

    const dismissAll = () => toast.dismiss();
    const notifySuceess = (text) => {
        dismissAll();
        toast.success(text);
    }
    const notifyWarning = (text) => {
        dismissAll();
        toast.warning(text);
    }

    const getData = () => {
        var data = [];
        axios
            .get(baseUrl + "/todos")
            .then((res) => {
                data = res.data;
            })
            .then(() => {
                setDataToShow([]);
                for (let i = 0; i < data.length; i++) {
                    const obj = { _id: data[i]._id, todo: data[i].todo, completed: data[i].completed }
                    setDataToShow(current => [...current, obj]);
                }
            })
            .catch((err) => {
                console.error(err);
            });
    }

    useEffect(getData, []);

    const addTodo = () => {
        if (newTodoInput.current.value.trim()) {
            axios
                .post(baseUrl + "/todos", { value: newTodoInput.current.value, completed: newTodoCheckbox.current.checked })
                .then((res) => {
                    setTodoAdded(true);
                    setIsDataRendered(false);
                    setDataToShow(current => [...current, res.data]);
                    notifySuceess("Todo added successfully");
                })
                .catch((err) => {
                    console.error(err);
                });
            newTodoCheckbox.current.checked = false;
            newTodoInput.current.value = "";
        }
        else {
            notifyWarning("Please enter todo value");
            return;
        }
    }

    const deleteTodo = (todo_Id) => {
        axios
            .delete(baseUrl + "/todos", { data: { id: todo_Id } })
            .then(() => {
                setDataToShow(current => current.filter(x => x._id !== todo_Id));
                notifySuceess("Todo deleted successfully");
            })
            .catch((err) => {
                console.error(err);
            });
    }

    // Check boundaries on delete and move to the last new page on add
    useEffect(() => {
        if (dataToShow.length) {
            if (!isDataRendered)
                setIsDataRendered(current=>!current);
            else {
                const lastPage = Math.ceil(dataToShow.length / currentPaginationModel.pageSize) - 1;
                if (currentPaginationModel.page > lastPage || currentPaginationModel.page < lastPage && todoAdded)
                {
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

    const sendPutRequestAndUpdateState = (params, index, endPoint) => {
        axios
            .put(baseUrl + endPoint, params)
            .then((res) => {
                const newData = [...dataToShow];
                newData[index] = res.data;
                setDataToShow(newData);
            })
            .catch((err) => {
                console.error(err);
            });
    }

    const returnRowByParams = (params) => {
        const api = params.api;
        const thisRow = {};
        api
            .getAllColumns()
            .filter((c) =>
                c.field !== "__check__" && !!c)
            .forEach((c) => (thisRow[c.field] = params.row[c.field]));
        return thisRow;
    }

    return (
        <>
            {dataToShow &&
                <div style={{ height: 400, width: '100%' }}>
                    <DataGrid
                        rows={dataToShow}
                        getRowId={(row) => row._id}
                        columns={columns}
                        apiRef={apiRef}
                        initialState={{
                            pagination: {
                                paginationModel: { page: 0, pageSize: 5 }
                            }
                        }}
                        pageSizeOptions={[5, 10, 25, 100]}
                        checkboxSelection
                        onPaginationModelChange={(newModel) => (setCurrentPaginationModel(newModel))}
                    />
                </div>
            }

            <div className="addTodoForm">
                <input type="text" ref={newTodoInput} />
                <input type="checkbox" ref={newTodoCheckbox} />
                <label>Completed?</label>
                <button onClick={addTodo}>Add Todo</button>
            </div>

        </>
    );

}

export default List;