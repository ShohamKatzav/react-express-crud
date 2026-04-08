import { useState } from 'react';
import { DataGrid } from "@mui/x-data-grid";
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from "@mui/material/IconButton";
import InputAdornment from '@mui/material/InputAdornment';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import OutlinedInput from '@mui/material/OutlinedInput';
import Popover from '@mui/material/Popover';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import FilterListRoundedIcon from '@mui/icons-material/FilterListRounded';
import TaskAltRoundedIcon from "@mui/icons-material/TaskAltRounded";
import RadioButtonUncheckedRoundedIcon from "@mui/icons-material/RadioButtonUncheckedRounded";
import EventRoundedIcon from '@mui/icons-material/EventRounded';
import FlagRoundedIcon from '@mui/icons-material/FlagRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { formatDueDate, getDueDateState, getPriorityColor, getPriorityLabel } from '../utils/todoFields';

const PRIORITY_SORT_ORDER = { high: 1, medium: 2, low: 3 };
const parseQuickFilter = (searchInput) =>
    searchInput.split(',').map((value) => value.trim()).filter(Boolean);
const compareDueDates = (dateA, dateB) => {
    const normalizedA = dateA || '9999-12-31';
    const normalizedB = dateB || '9999-12-31';
    return normalizedA.localeCompare(normalizedB);
};

function TodoToolbar({
    quickFilterValue,
    setQuickFilterValue,
    priorityCounts,
    priorityFilter,
    setPriorityFilter,
    statusCounts,
    statusFilter,
    setStatusFilter,
}) {
    const filterOptions = [
        { key: 'all', label: 'All', count: statusCounts.all },
        { key: 'active', label: 'In focus', count: statusCounts.active },
        { key: 'done', label: 'Done', count: statusCounts.done },
    ];
    const priorityOptions = [
        { key: 'all', label: 'All priorities', count: priorityCounts.all },
        { key: 'high', label: 'High', count: priorityCounts.high },
        { key: 'medium', label: 'Medium', count: priorityCounts.medium },
        { key: 'low', label: 'Low', count: priorityCounts.low },
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
                <Stack direction="row" flexWrap="wrap" gap={0.8} sx={{ mt: 1 }}>
                    {priorityOptions.map((option) => (
                        <Chip
                            clickable
                            color={priorityFilter === option.key ? 'primary' : 'default'}
                            icon={<FlagRoundedIcon />}
                            key={option.key}
                            label={`${option.label} (${option.count})`}
                            onClick={() => setPriorityFilter(option.key)}
                            size="small"
                            variant={priorityFilter === option.key ? 'filled' : 'outlined'}
                        />
                    ))}
                </Stack>
            </Box>
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    width: '100%',
                    maxWidth: { md: 260 },
                    borderRadius: 999,
                }}
            >
                <OutlinedInput
                    fullWidth
                    onChange={(event) => setQuickFilterValue(event.target.value)}
                    placeholder="Search..."
                    startAdornment={
                        <InputAdornment position="start">
                            <SearchRoundedIcon sx={{ fontSize: '1rem' }} />
                        </InputAdornment>
                    }
                    endAdornment={quickFilterValue ? (
                        <InputAdornment position="end">
                            <IconButton
                                aria-label="Clear search"
                                edge="end"
                                onClick={() => setQuickFilterValue('')}
                                size="small"
                            >
                                <CloseRoundedIcon sx={{ fontSize: '1rem' }} />
                            </IconButton>
                        </InputAdornment>
                    ) : null}
                    size="small"
                    sx={{
                        height: 34,
                        background: 'rgba(255, 250, 244, 0.7)',
                        borderRadius: 999,
                        fontSize: '0.9rem',
                        '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'rgba(31, 64, 87, 0.12)',
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'rgba(31, 64, 87, 0.2)',
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'rgba(31, 64, 87, 0.28)',
                        },
                        '& .MuiOutlinedInput-input': {
                            padding: '7px 0',
                        },
                        '& .MuiInputAdornment-root': {
                            color: 'text.secondary',
                        },
                        '& .MuiIconButton-root': {
                            padding: '3px',
                        }
                    }}
                    value={quickFilterValue}
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
    editDueDate,
    editPriority,
    editText,
    editStatus,
    isLoading,
    priorityCounts,
    priorityFilter,
    setCurrentPaginationModel,
    setPriorityFilter,
    apiRef,
    setSelectedRows,
    statusCounts,
    statusFilter,
    setStatusFilter,
}) {
    const [priorityMenuAnchor, setPriorityMenuAnchor] = useState(null);
    const [priorityMenuTodo, setPriorityMenuTodo] = useState(null);
    const [dueDatePopoverAnchor, setDueDatePopoverAnchor] = useState(null);
    const [dueDatePopoverTodo, setDueDatePopoverTodo] = useState(null);
    const [dueDateDraft, setDueDateDraft] = useState('');
    const [quickFilterValue, setQuickFilterValue] = useState('');

    const openPriorityMenu = (event, row) => {
        event.stopPropagation();
        setPriorityMenuAnchor(event.currentTarget);
        setPriorityMenuTodo(row);
    };

    const closePriorityMenu = () => {
        setPriorityMenuAnchor(null);
        setPriorityMenuTodo(null);
    };

    const handlePrioritySelect = async (priority) => {
        if (!priorityMenuTodo) {
            return;
        }

        const todoId = priorityMenuTodo._id;
        closePriorityMenu();
        await editPriority(todoId, priority);
    };

    const openDueDateEditor = (event, row) => {
        event.stopPropagation();
        setDueDatePopoverAnchor(event.currentTarget);
        setDueDatePopoverTodo(row);
        setDueDateDraft(row.dueDate || '');
    };

    const closeDueDateEditor = () => {
        setDueDatePopoverAnchor(null);
        setDueDatePopoverTodo(null);
        setDueDateDraft('');
    };

    const handleDueDateSave = async () => {
        if (!dueDatePopoverTodo) {
            return;
        }

        const todoId = dueDatePopoverTodo._id;
        const nextDueDate = dueDateDraft;
        closeDueDateEditor();
        await editDueDate(todoId, nextDueDate);
    };

    const handleDueDateClear = async () => {
        if (!dueDatePopoverTodo) {
            return;
        }

        const todoId = dueDatePopoverTodo._id;
        closeDueDateEditor();
        await editDueDate(todoId, '');
    };

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
                field: "priority",
                flex: 0.45,
                headerName: "Priority",
                minWidth: 140,
                sortComparator: (priorityA, priorityB) =>
                    (PRIORITY_SORT_ORDER[priorityA || 'medium'] || PRIORITY_SORT_ORDER.medium)
                    - (PRIORITY_SORT_ORDER[priorityB || 'medium'] || PRIORITY_SORT_ORDER.medium),
                cellClassName: 'todo-table__cell--centered',
                renderCell: (params) => {
                    const onClick = (event) => {
                        openPriorityMenu(event, params.row);
                    };

                    return (
                        <Chip
                            clickable
                            color={getPriorityColor(params.value || 'medium')}
                            icon={<FlagRoundedIcon />}
                            label={getPriorityLabel(params.value || 'medium')}
                            onClick={onClick}
                            size="small"
                            variant="outlined"
                        />
                    );
                },
            },
            {
                field: "dueDate",
                flex: 0.55,
                headerName: "Due date",
                minWidth: 160,
                sortComparator: compareDueDates,
                cellClassName: 'todo-table__cell--centered',
                renderCell: (params) => {
                    const dueDate = params.value || '';
                    const dueDateState = getDueDateState(dueDate);
                    const isComplete = Boolean(params.row.completed);

                    let color = 'default';
                    let variant = 'outlined';

                    if (dueDateState === 'today') {
                        color = 'secondary';
                        variant = 'filled';
                    } else if (dueDateState === 'overdue' && !isComplete) {
                        color = 'error';
                        variant = 'filled';
                    } else if (dueDateState === 'upcoming') {
                        color = 'info';
                    }

                    const onClick = (event) => {
                        openDueDateEditor(event, params.row);
                    };

                    return (
                        <Chip
                            clickable
                            color={color}
                            icon={<EventRoundedIcon />}
                            label={formatDueDate(dueDate)}
                            onClick={onClick}
                            size="small"
                            variant={variant}
                        />
                    );
                },
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
                    filterModel={{
                        items: [],
                        quickFilterValues: parseQuickFilter(quickFilterValue),
                    }}
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
                            quickFilterValue,
                            setQuickFilterValue,
                            priorityCounts,
                            priorityFilter,
                            setPriorityFilter,
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
                            gap: 1.5,
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
                    }}
                />
                <Menu
                    anchorEl={priorityMenuAnchor}
                    onClose={closePriorityMenu}
                    open={Boolean(priorityMenuAnchor)}
                >
                    {['high', 'medium', 'low'].map((priority) => (
                        <MenuItem
                            key={priority}
                            onClick={() => handlePrioritySelect(priority)}
                            selected={(priorityMenuTodo?.priority || 'medium') === priority}
                        >
                            {getPriorityLabel(priority)}
                        </MenuItem>
                    ))}
                </Menu>
                <Popover
                    anchorEl={dueDatePopoverAnchor}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                    onClose={closeDueDateEditor}
                    open={Boolean(dueDatePopoverAnchor)}
                    transformOrigin={{ vertical: 'top', horizontal: 'left' }}
                >
                    <Box sx={{ p: 2, width: 280, maxWidth: 'calc(100vw - 32px)' }}>
                        <Stack spacing={1.4}>
                            <Typography sx={{ fontWeight: 700 }}>
                                Edit due date
                            </Typography>
                            <TextField
                                fullWidth
                                label="Due date"
                                onChange={(event) => setDueDateDraft(event.target.value)}
                                type="date"
                                value={dueDateDraft}
                                InputLabelProps={{ shrink: true }}
                            />
                            <Stack direction="row" justifyContent="space-between" spacing={1}>
                                <Button onClick={handleDueDateClear} variant="text">
                                    Clear
                                </Button>
                                <Stack direction="row" spacing={1}>
                                    <Button onClick={closeDueDateEditor} variant="text">
                                        Cancel
                                    </Button>
                                    <Button color="secondary" onClick={handleDueDateSave} variant="contained">
                                        Save
                                    </Button>
                                </Stack>
                            </Stack>
                        </Stack>
                    </Box>
                </Popover>
            </Box>
        )
    );
}
export default TodoTable;
