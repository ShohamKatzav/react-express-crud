
import React from "react";
import { DataGrid } from "@mui/x-data-grid";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";

function TodoTable({ dataToShow, deleteTodo, editText, editStatus, setCurrentPaginationModel, apiRef }) {

    const columns =
        [
            { field: '_id', headerName: 'ID', width: 70, valueGetter: (params) => params.row._id.slice(-6) },
            { field: 'todo', headerName: 'To Do', width: 600 },
            { field: 'completed', headerName: 'Status', type: 'boolean' },
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
            }
        </>
    );
}

export default TodoTable;