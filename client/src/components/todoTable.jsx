import { DataGrid, GridToolbarQuickFilter } from "@mui/x-data-grid";
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from "@mui/material/IconButton";
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import FilterListRoundedIcon from '@mui/icons-material/FilterListRounded';
import TaskAltRoundedIcon from "@mui/icons-material/TaskAltRounded";
import RadioButtonUncheckedRoundedIcon from "@mui/icons-material/RadioButtonUncheckedRounded";

function TodoToolbar({ statusCounts, statusFilter, setStatusFilter }) {
    const filterOptions = [
        { key: 'all', label: 'All', count: statusCounts.all },
        { key: 'active', label: 'In focus', count: statusCounts.active },
        { key: 'done', label: 'Done', count: statusCounts.done },
    ];

    return (
        <Stack
            direction={{ xs: 'column', md: 'row' }}
            justifyContent="space-between"
            spacing={1.5}
            sx={{ px: 0.5, pb: 1.5 }}
        >
            <Box>
                <Typography sx={{ fontWeight: 700 }} variant="h6">
                    Your task list
                </Typography>
                <Typography sx={{ color: 'text.secondary' }}>
                    Search, select, and update tasks directly from the grid.
                </Typography>
                <Stack direction="row" flexWrap="wrap" gap={0.8} sx={{ mt: 1.3 }}>
                    {filterOptions.map((option) => (
                        <Chip
                            clickable
                            color={statusFilter === option.key ? 'secondary' : 'default'}
                            icon={<FilterListRoundedIcon />}
                            key={option.key}
                            label={`${option.label} (${option.count})`}
                            onClick={() => setStatusFilter(option.key)}
                            size="small"
                            variant={statusFilter === option.key ? 'filled' : 'outlined'}
                        />
                    ))}
                </Stack>
            </Box>
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    px: 1.4,
                    py: 0.8,
                    borderRadius: 999,
                    border: '1px solid rgba(31, 64, 87, 0.12)',
                    background: 'rgba(255, 250, 244, 0.7)',
                    minWidth: { xs: '100%', md: 260 },
                }}
            >
                <GridToolbarQuickFilter
                    debounceMs={250}
                    quickFilterParser={(searchInput) =>
                        searchInput.split(',').map((value) => value.trim()).filter(Boolean)
                    }
                />
            </Box>
        </Stack>
    );
}

function EmptyState() {
    return (
        <Stack alignItems="center" justifyContent="center" spacing={1.2} sx={{ height: '100%', py: 5 }}>
            <Typography variant="h6">Nothing here yet</Typography>
            <Typography sx={{ color: 'text.secondary', maxWidth: 34 + 'ch', textAlign: 'center' }}>
                Add your first task or import a sample batch to bring the workspace to life.
            </Typography>
        </Stack>
    );
}

function LoadingState() {
    return (
        <Stack alignItems="center" justifyContent="center" spacing={1.5} sx={{ height: '100%', py: 5 }}>
            <CircularProgress color="secondary" size={34} />
            <Typography sx={{ color: 'text.secondary' }}>
                Loading your tasks...
            </Typography>
        </Stack>
    );
}

function TodoTable({
    dataToShow,
    deleteTodo,
    editText,
    editStatus,
    isLoading,
    setCurrentPaginationModel,
    apiRef,
    setSelectedRows,
    statusCounts,
    statusFilter,
    setStatusFilter,
}) {

    const columns =
        [
            {
                field: '_id',
                headerName: "Ref",
                minWidth: 110,
                sortable: false,
                cellClassName: 'todo-table__cell--centered',
                renderCell: (params) => (
                    <Chip
                        label={`#${params.row._id.slice(-4).toUpperCase()}`}
                        size="small"
                        variant="outlined"
                    />
                ),
            },
            {
                field: 'todo',
                flex: 1.2,
                headerName: "Task",
                minWidth: 240,
                cellClassName: 'todo-table__cell--task',
                renderCell: (params) => (
                    <Box sx={{ py: 1.6, width: '100%' }}>
                        <Typography
                            sx={{
                                whiteSpace: 'normal',
                                lineHeight: 1.5,
                                fontWeight: 700,
                                color: params.row.completed ? 'text.secondary' : 'text.primary',
                                textDecoration: params.row.completed ? 'line-through' : 'none',
                            }}
                        >
                            {params.value}
                        </Typography>
                    </Box>
                ),
            },
            {
                field: "completed",
                flex: 0.45,
                headerName: "Status",
                minWidth: 140,
                sortable: false,
                cellClassName: 'todo-table__cell--centered',
                renderCell: (params) => {
                    const onClick = (e) => {
                        e.stopPropagation();
                        return editStatus(params.row._id);
                    };
                    return (
                        <Chip
                            clickable
                            color={params.value ? 'success' : 'warning'}
                            icon={params.value ? <TaskAltRoundedIcon /> : <RadioButtonUncheckedRoundedIcon />}
                            label={params.value ? 'Done' : 'In focus'}
                            onClick={onClick}
                            variant={params.value ? 'filled' : 'outlined'}
                        />
                    );
                },
                type: 'boolean'
            },
            {
                field: "actions",
                flex: 0.45,
                headerName: "Actions",
                minWidth: 140,
                sortable: false,
                cellClassName: 'todo-table__cell--centered',
                renderCell: (params) => {
                    const handleEdit = (event) => {
                        event.stopPropagation();
                        editText(params.row._id);
                    };
                    const handleDelete = (event) => {
                        event.stopPropagation();
                        deleteTodo(params.row._id);
                    };

                    return (
                        <Stack direction="row" spacing={0.6}>
                            <Tooltip title="Edit task">
                                <IconButton color="primary" onClick={handleEdit}>
                                    <EditIcon />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete task">
                                <IconButton color="error" onClick={handleDelete}>
                                    <DeleteIcon />
                                </IconButton>
                            </Tooltip>
                        </Stack>
                    );
                }
            },

        ]

    return (
        dataToShow && (
            <Box sx={{ width: '100%' }}>
                <DataGrid
                    apiRef={apiRef}
                    checkboxSelection
                    columns={columns}
                    density="comfortable"
                    disableColumnMenu
                    disableRowSelectionOnClick
                    getRowClassName={(params) => (params.row.completed ? 'todo-row--complete' : '')}
                    getRowHeight={() => 'auto'}
                    getRowId={(row) => row._id}
                    loading={isLoading}
                    initialState={{
                        pagination: {
                            paginationModel: { page: 0, pageSize: 5 }
                        }
                    }}
                    onPaginationModelChange={(newModel) => setCurrentPaginationModel(newModel)}
                    onRowSelectionModelChange={(newRowSelectionModel) => {
                        setSelectedRows(newRowSelectionModel);
                    }}
                    pageSizeOptions={[5, 10, 25, 100]}
                rows={dataToShow}
                    slots={{
                        toolbar: TodoToolbar,
                        loadingOverlay: LoadingState,
                        noRowsOverlay: EmptyState,
                    }}
                    slotProps={{
                        toolbar: {
                            statusCounts,
                            statusFilter,
                            setStatusFilter,
                        },
                    }}
                    sx={{
                        minHeight: 460,
                        border: 'none',
                        backgroundColor: 'transparent',
                        '& .MuiDataGrid-toolbarContainer': {
                            px: 0,
                            pt: 0,
                        },
                        '& .MuiDataGrid-columnHeaders': {
                            borderBottom: '1px solid rgba(31, 64, 87, 0.1)',
                            backgroundColor: 'rgba(255, 250, 244, 0.6)',
                            borderRadius: '18px 18px 0 0',
                        },
                        '& .MuiDataGrid-columnHeaderTitle': {
                            fontWeight: 800,
                        },
                        '& .MuiDataGrid-cell': {
                            alignItems: 'center',
                            borderBottom: '1px solid rgba(31, 64, 87, 0.08)',
                            py: 0.4,
                        },
                        '& .todo-table__cell--task': {
                            alignItems: 'flex-start',
                        },
                        '& .todo-table__cell--centered': {
                            alignItems: 'center',
                        },
                        '& .MuiDataGrid-row': {
                            backgroundColor: 'rgba(255, 250, 244, 0.36)',
                        },
                        '& .MuiDataGrid-row:hover': {
                            backgroundColor: 'rgba(217, 103, 77, 0.08)',
                        },
                        '& .MuiDataGrid-row.todo-row--complete': {
                            backgroundColor: 'rgba(63, 138, 105, 0.06)',
                        },
                        '& .MuiDataGrid-footerContainer': {
                            borderTop: '1px solid rgba(31, 64, 87, 0.1)',
                        },
                        '& .MuiDataGrid-virtualScroller': {
                            minHeight: 340,
                        },
                        '& .MuiDataGrid-cell:focus, & .MuiDataGrid-columnHeader:focus, & .MuiDataGrid-cell:focus-within, & .MuiDataGrid-columnHeader:focus-within': {
                            outline: 'none',
                        },
                        '& .MuiDataGrid-toolbarContainer .MuiInputBase-root': {
                            width: '100%',
                        },
                        '& .MuiDataGrid-toolbarContainer .MuiInputBase-input': {
                            py: 0.4,
                        },
                    }}
                />
            </Box>
        )
    );
}
export default TodoTable;
