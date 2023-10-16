
import React from "react";
import { DataGrid } from "@mui/x-data-grid";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";

function TodoTable({ dataToShow, deleteTodo, editText, editStatus, setCurrentPaginationModel, apiRef }) {

    const columns =
        [
            { field: '_id', flex: 0.3, headerName: 'ID', valueGetter: (params) => params.row._id.slice(-6) },
            { field: 'todo', flex: 1.0, headerName: 'To Do' },
            { field: 'completed', flex: 0.3, headerName: "Status", type: 'boolean' },
            {
                field: "changeStatus",
                flex: 0.3,
                headerName: "Change Status",
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
                flex: 0.2,
                headerName: "Edit",
                description: 'Edit todo text',
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
            {
                field: "delete",
                flex: 0.2,
                headerName: "Delete",
                description: 'Delete todo',
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

        ]
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
                <div className="table-container">
                    <div className="todoTable">
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
                            onPaginationModelChange={(newModel) => (setCurrentPaginationModel(newModel))}
                        />
                    </div>
                </div>
            }
        </>
    );
}


export default TodoTable;