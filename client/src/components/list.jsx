import { React, useEffect, useState, useRef } from "react";
import axios from "axios";
import IconButton from "@mui/material/IconButton";
import { DataGrid } from "@mui/x-data-grid";
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';


function List() {

    const baseUrl = "/api/v1";
    const [dataToShow, SetDataToShow] = useState([]);
    const newTodoInput = useRef("");
    const newTodoCheckbox = useRef(false);
    const columns = [
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
                    return editTodo(thisRow._id, "completed");
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
                    return editTodo(thisRow._id, "todo");
                };

                return <IconButton onClick={onClick} color="primary">
                    <EditIcon />
                </IconButton>
            }
        },

    ]

    const getData = () => {
        var data = [];
        axios
            .get(baseUrl + "/todos")
            .then((res) => {
                data = res.data;
            })
            .then(() => {
                SetDataToShow([]);
                for (let i = 0; i < data.length; i++) {
                    const obj = { _id: data[i]._id, todo: data[i].todo, completed: data[i].completed }
                    SetDataToShow(current => [...current, obj]);
                }
            })
            .catch((err) => {
                console.error(err);
            });
    }

    const addTodo = () => {
        axios
            .post(baseUrl + "/todos", { value: newTodoInput.current.value, completed: newTodoCheckbox.current.checked })
            .then((res) => {
                const newData = [...dataToShow, res.data]
                SetDataToShow(newData);
            })
            .catch((err) => {
                console.error(err);
            });
        newTodoCheckbox.current.checked = false;
        newTodoInput.current.value = "";
    }

    const deleteTodo = (todo_Id) => {
        axios
            .delete(baseUrl + "/todos", { data: { id: todo_Id } })
            .then(() => {
                const newData = dataToShow.filter(x => x._id != todo_Id);
                SetDataToShow(newData);
            })
            .catch((err) => {
                console.error(err);
            });
    }

    const editTodo = (todo_Id, changesType) => {
        var params = { changesType: changesType, id: todo_Id };
        if (changesType == "completed")
            params = { ...params, completed: (!(dataToShow.find(c => c._id == todo_Id).completed)) };
        else {
            const newTodoValue = prompt('Please enter new todo value');
            params = { ...params, todo: newTodoValue };
        }
        axios
            .put(baseUrl + "/editTodo", params)
            .then((res) => {
                const index = dataToShow.findIndex(c => c._id == todo_Id);
                const newData = [...dataToShow];
                newData[index] = res.data.value;
                SetDataToShow(newData);
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

    useEffect(getData, []);

    return (
        <>

            {dataToShow &&
                <div style={{ height: 400, width: '100%' }}>
                    <DataGrid
                        rows={dataToShow}
                        getRowId={(row) => row._id}
                        columns={columns}
                        initialState={{
                            pagination: {
                                paginationModel: { page: 0, pageSize: 5 },
                            },
                        }}
                        pageSizeOptions={[5, 10]}
                        checkboxSelection
                    />
                </div>
            }

            <input type="text" ref={newTodoInput} />
            <input type="checkbox" ref={newTodoCheckbox} />
            <label>Completed?</label>
            <button onClick={addTodo} >Add Todo</button>
        </>
    );
}

export default List;