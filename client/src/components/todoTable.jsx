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
import TaskAltRoundedIcon from "@mui/icons-material/TaskAltRounded";
import RadioButtonUncheckedRoundedIcon from "@mui/icons-material/RadioButtonUncheckedRounded";
import EventRoundedIcon from '@mui/icons-material/EventRounded';
import FlagRoundedIcon from '@mui/icons-material/FlagRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import ProjectChip from './projectChip';
import { formatDueDate, getDueDateState, getPriorityColor, getPriorityLabel } from '../utils/todoFields';

const PRIORITY_SORT_ORDER = { high: 1, medium: 2, low: 3 };

const parseQuickFilter = (searchInput) =>
    searchInput.split(',').map((value) => value.trim()).filter(Boolean);

const compareDueDates = (dateA, dateB) => {
    const normalizedA = dateA || '9999-12-31';
    const normalizedB = dateB || '9999-12-31';
    return normalizedA.localeCompare(normalizedB);
};

function TodoToolbar({ quickFilterValue, setQuickFilterValue, totalCount }) {
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
                    Search across the current view and make quick updates inline.
                </Typography>
                <Stack direction="row" flexWrap="wrap" gap={0.8} sx={{ mt: 1.2 }}>
                    <Chip label={`${totalCount} task${totalCount === 1 ? '' : 's'} visible`} size="small" variant="outlined" />
                </Stack>
            </Box>
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    width: '100%',
                    maxWidth: { md: 280 },
                    borderRadius: 999,
                }}
            >
                <OutlinedInput
                    fullWidth
                    onChange={(event) => setQuickFilterValue(event.target.value)}
                    placeholder="Search this view..."
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
            <Typography variant="h6">Nothing matches these filters</Typography>
            <Typography sx={{ color: 'text.secondary', maxWidth: 38 + 'ch', textAlign: 'center' }}>
                Try another project or status filter, or add a fresh task to fill the workspace back up.
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
    editProject,
    editPriority,
    editText,
    editStatus,
    isLoading,
    projects,
    setCurrentPaginationModel,
    apiRef,
    setSelectedRows,
}) {
    const [priorityMenuAnchor, setPriorityMenuAnchor] = useState(null);
    const [priorityMenuTodo, setPriorityMenuTodo] = useState(null);
    const [projectMenuAnchor, setProjectMenuAnchor] = useState(null);
    const [projectMenuTodo, setProjectMenuTodo] = useState(null);
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

    const openProjectMenu = (event, row) => {
        event.stopPropagation();
        setProjectMenuAnchor(event.currentTarget);
        setProjectMenuTodo(row);
    };

    const closeProjectMenu = () => {
        setProjectMenuAnchor(null);
        setProjectMenuTodo(null);
    };

    const handlePrioritySelect = async (priority) => {
        if (!priorityMenuTodo) {
            return;
        }

        const todoId = priorityMenuTodo._id;
        closePriorityMenu();
        await editPriority(todoId, priority);
    };

    const handleProjectSelect = async (projectName) => {
        if (!projectMenuTodo) {
            return;
        }

        const todoId = projectMenuTodo._id;
        closeProjectMenu();
        await editProject(todoId, projectName);
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

    const columns = [
        {
            field: '_id',
            headerName: "Ref",
            minWidth: 108,
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
            field: 'project',
            flex: 0.5,
            headerName: 'Project',
            minWidth: 140,
            cellClassName: 'todo-table__cell--centered',
            renderCell: (params) => (
                <Box onClick={(event) => openProjectMenu(event, params.row)} sx={{ cursor: 'pointer' }}>
                    <ProjectChip project={params.value} />
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
                const onClick = (event) => {
                    event.stopPropagation();
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
            flex: 0.6,
            headerName: "Due date",
            minWidth: 170,
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
                        sx={dueDateState === 'overdue' && !isComplete ? { fontWeight: 800 } : undefined}
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
    ];

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
                    getRowClassName={(params) => {
                        const dueDateState = getDueDateState(params.row.dueDate || '');
                        const classNames = [];

                        if (params.row.completed) {
                            classNames.push('todo-row--complete');
                        }

                        if (!params.row.completed && dueDateState === 'overdue') {
                            classNames.push('todo-row--overdue');
                        }

                        return classNames.join(' ');
                    }}
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
                            totalCount: dataToShow.length,
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
                            transition: 'background-color 150ms ease, box-shadow 150ms ease',
                        },
                        '& .MuiDataGrid-row:hover': {
                            backgroundColor: 'rgba(217, 103, 77, 0.08)',
                        },
                        '& .MuiDataGrid-row.todo-row--complete': {
                            backgroundColor: 'rgba(63, 138, 105, 0.06)',
                        },
                        '& .MuiDataGrid-row.todo-row--overdue': {
                            backgroundColor: 'rgba(255, 235, 233, 0.92)',
                            boxShadow: 'inset 5px 0 0 #d32f2f',
                        },
                        '& .MuiDataGrid-row.todo-row--overdue:hover': {
                            backgroundColor: 'rgba(255, 224, 220, 0.96)',
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
                    anchorEl={projectMenuAnchor}
                    onClose={closeProjectMenu}
                    open={Boolean(projectMenuAnchor)}
                >
                    {(projects || []).map((project) => (
                        <MenuItem
                            key={project._id || project.name}
                            onClick={() => handleProjectSelect(project.name)}
                            selected={projectMenuTodo?.project === project.name}
                        >
                            {project.name}
                        </MenuItem>
                    ))}
                </Menu>
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
