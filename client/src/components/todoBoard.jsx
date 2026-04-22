import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import EventRoundedIcon from '@mui/icons-material/EventRounded';
import FlagRoundedIcon from '@mui/icons-material/FlagRounded';
import TaskAltRoundedIcon from "@mui/icons-material/TaskAltRounded";
import RadioButtonUncheckedRoundedIcon from "@mui/icons-material/RadioButtonUncheckedRounded";
import ProjectChip from './projectChip';
import { formatDueDate, getDueDateState, getPriorityColor, getPriorityLabel, sortTodosByUrgency } from '../utils/todoFields';

function TodoBoard({ todos, deleteTodo, editText, editStatus }) {
    const groupedTodos = {
        overdue: sortTodosByUrgency(todos.filter((todo) => !todo.completed && getDueDateState(todo.dueDate || '') === 'overdue')),
        focus: sortTodosByUrgency(todos.filter((todo) => !todo.completed && getDueDateState(todo.dueDate || '') !== 'overdue')),
        done: sortTodosByUrgency(todos.filter((todo) => todo.completed)),
    };

    const columns = [
        {
            key: 'overdue',
            title: 'Overdue',
            subtitle: 'Tasks that need attention right away.',
            accent: 'rgba(211, 47, 47, 0.08)',
            border: 'rgba(211, 47, 47, 0.18)',
            emptyText: 'Nothing overdue right now.',
        },
        {
            key: 'focus',
            title: 'In Focus',
            subtitle: 'Active tasks that are still in motion.',
            accent: 'rgba(217, 103, 77, 0.08)',
            border: 'rgba(217, 103, 77, 0.16)',
            emptyText: 'No active tasks in this slice.',
        },
        {
            key: 'done',
            title: 'Done',
            subtitle: 'Finished work that is already wrapped up.',
            accent: 'rgba(63, 138, 105, 0.08)',
            border: 'rgba(63, 138, 105, 0.18)',
            emptyText: 'Nothing completed yet.',
        },
    ];

    return (
        <Box
            sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', xl: 'repeat(3, minmax(0, 1fr))' },
                gap: 2,
            }}
        >
            {columns.map((column) => (
                <Paper
                    key={column.key}
                    sx={{
                        p: 2,
                        borderRadius: '28px',
                        border: `1px solid ${column.border}`,
                        background: column.accent,
                        minHeight: 420,
                    }}
                    variant="outlined"
                >
                    <Stack spacing={1.6}>
                        <Box>
                            <Stack alignItems="center" direction="row" justifyContent="space-between" spacing={1}>
                                <Typography variant="h5">{column.title}</Typography>
                                <Chip label={groupedTodos[column.key].length} size="small" variant="outlined" />
                            </Stack>
                            <Typography sx={{ color: 'text.secondary', mt: 0.5 }}>
                                {column.subtitle}
                            </Typography>
                        </Box>

                        <Stack spacing={1.2}>
                            {groupedTodos[column.key].length ? groupedTodos[column.key].map((todo) => {
                                const dueDateState = getDueDateState(todo.dueDate || '');

                                return (
                                    <Paper
                                        key={todo._id}
                                        sx={{
                                            p: 1.5,
                                            borderRadius: '20px',
                                            border: dueDateState === 'overdue' && !todo.completed
                                                ? '1px solid rgba(211, 47, 47, 0.22)'
                                                : '1px solid rgba(31, 64, 87, 0.1)',
                                            background: dueDateState === 'overdue' && !todo.completed
                                                ? 'rgba(255, 244, 244, 0.96)'
                                                : 'rgba(255, 255, 255, 0.7)',
                                        }}
                                        variant="outlined"
                                    >
                                        <Stack spacing={1.1}>
                                            <Stack direction="row" flexWrap="wrap" gap={0.8}>
                                                <ProjectChip project={todo.project} />
                                                <Chip
                                                    color={getPriorityColor(todo.priority || 'medium')}
                                                    icon={<FlagRoundedIcon />}
                                                    label={getPriorityLabel(todo.priority || 'medium')}
                                                    size="small"
                                                    variant="outlined"
                                                />
                                                {!!todo.dueDate && (
                                                    <Chip
                                                        color={dueDateState === 'overdue' && !todo.completed ? 'error' : dueDateState === 'today' ? 'secondary' : 'default'}
                                                        icon={<EventRoundedIcon />}
                                                        label={formatDueDate(todo.dueDate)}
                                                        size="small"
                                                        variant={dueDateState === 'overdue' && !todo.completed ? 'filled' : 'outlined'}
                                                    />
                                                )}
                                            </Stack>

                                            <Typography
                                                sx={{
                                                    fontWeight: 700,
                                                    lineHeight: 1.45,
                                                    textDecoration: todo.completed ? 'line-through' : 'none',
                                                    color: todo.completed ? 'text.secondary' : 'text.primary',
                                                }}
                                            >
                                                {todo.todo}
                                            </Typography>

                                            <Stack direction="row" justifyContent="space-between" spacing={1}>
                                                <ButtonLikeToggle todo={todo} editStatus={editStatus} />
                                                <Stack direction="row" spacing={0.5}>
                                                    <Tooltip title="Edit task">
                                                        <IconButton color="primary" onClick={() => editText(todo._id)} size="small">
                                                            <EditIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Delete task">
                                                        <IconButton color="error" onClick={() => deleteTodo(todo._id)} size="small">
                                                            <DeleteIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                </Stack>
                                            </Stack>
                                        </Stack>
                                    </Paper>
                                );
                            }) : (
                                <Paper
                                    sx={{
                                        p: 2.4,
                                        borderRadius: '20px',
                                        border: '1px dashed rgba(31, 64, 87, 0.16)',
                                        background: 'rgba(255, 255, 255, 0.55)',
                                    }}
                                    variant="outlined"
                                >
                                    <Typography sx={{ color: 'text.secondary' }}>
                                        {column.emptyText}
                                    </Typography>
                                </Paper>
                            )}
                        </Stack>
                    </Stack>
                </Paper>
            ))}
        </Box>
    );
}

function ButtonLikeToggle({ todo, editStatus }) {
    const isDone = Boolean(todo.completed);

    return (
        <Chip
            clickable
            color={isDone ? 'success' : 'warning'}
            icon={isDone ? <TaskAltRoundedIcon /> : <RadioButtonUncheckedRoundedIcon />}
            label={isDone ? 'Mark active' : 'Mark done'}
            onClick={() => editStatus(todo._id)}
            size="small"
            variant={isDone ? 'filled' : 'outlined'}
        />
    );
}

export default TodoBoard;
