import { useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import EventBusyRoundedIcon from '@mui/icons-material/EventBusyRounded';
import TaskAltRoundedIcon from "@mui/icons-material/TaskAltRounded";
import RadioButtonUncheckedRoundedIcon from "@mui/icons-material/RadioButtonUncheckedRounded";
import ProjectChip from './projectChip';
import { getDueDateState, sortTodosByUrgency } from '../utils/todoFields';

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const buildMonthLabel = (date) =>
    new Intl.DateTimeFormat(undefined, { month: 'long', year: 'numeric' }).format(date);

const buildIsoDate = (date) =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

function TodoCalendar({ todos, deleteTodo, editText, editStatus }) {
    const [visibleMonth, setVisibleMonth] = useState(() => {
        const now = new Date();
        return new Date(now.getFullYear(), now.getMonth(), 1);
    });

    const todosByDate = useMemo(() => {
        const entries = {};

        sortTodosByUrgency(todos.filter((todo) => todo.dueDate)).forEach((todo) => {
            if (!entries[todo.dueDate]) {
                entries[todo.dueDate] = [];
            }

            entries[todo.dueDate].push(todo);
        });

        return entries;
    }, [todos]);

    const calendarDays = useMemo(() => {
        const days = [];
        const firstVisibleDate = new Date(visibleMonth);
        firstVisibleDate.setDate(1 - firstVisibleDate.getDay());

        for (let index = 0; index < 42; index += 1) {
            const day = new Date(firstVisibleDate);
            day.setDate(firstVisibleDate.getDate() + index);
            const isoDate = buildIsoDate(day);

            days.push({
                date: day,
                isoDate,
                isCurrentMonth: day.getMonth() === visibleMonth.getMonth(),
                isToday: isoDate === buildIsoDate(new Date()),
                todos: todosByDate[isoDate] || [],
            });
        }

        return days;
    }, [todosByDate, visibleMonth]);

    const dueThisMonth = todos.filter((todo) => {
        if (!todo.dueDate) {
            return false;
        }

        const todoDate = new Date(`${todo.dueDate}T00:00:00`);
        return (
            todoDate.getFullYear() === visibleMonth.getFullYear()
            && todoDate.getMonth() === visibleMonth.getMonth()
        );
    }).length;

    const overdueThisMonth = todos.filter((todo) =>
        todo.dueDate
        && !todo.completed
        && getDueDateState(todo.dueDate) === 'overdue'
        && new Date(`${todo.dueDate}T00:00:00`).getMonth() === visibleMonth.getMonth()
        && new Date(`${todo.dueDate}T00:00:00`).getFullYear() === visibleMonth.getFullYear()
    ).length;

    return (
        <Paper
            sx={{
                p: { xs: 1.2, md: 1.8 },
                borderRadius: '28px',
                border: '1px solid rgba(31, 64, 87, 0.1)',
                background: 'rgba(255, 252, 247, 0.62)',
            }}
            variant="outlined"
        >
            <Stack spacing={1.8}>
                <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={1.2}>
                    <Box>
                        <Typography variant="h4">{buildMonthLabel(visibleMonth)}</Typography>
                        <Typography sx={{ color: 'text.secondary', mt: 0.5 }}>
                            Scan due dates by day and spot overloaded stretches before they become overdue.
                        </Typography>
                    </Box>
                    <Stack alignItems={{ xs: 'stretch', md: 'center' }} direction={{ xs: 'column', md: 'row' }} spacing={1}>
                        <Chip label={`${dueThisMonth} due this month`} variant="outlined" />
                        <Chip
                            color={overdueThisMonth ? 'error' : 'default'}
                            icon={<EventBusyRoundedIcon />}
                            label={`${overdueThisMonth} overdue in view`}
                            variant="outlined"
                        />
                        <Stack direction="row" spacing={0.4}>
                            <IconButton onClick={() => setVisibleMonth((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1))}>
                                <ChevronLeftRoundedIcon />
                            </IconButton>
                            <IconButton onClick={() => setVisibleMonth(new Date(new Date().getFullYear(), new Date().getMonth(), 1))}>
                                <TaskAltRoundedIcon />
                            </IconButton>
                            <IconButton onClick={() => setVisibleMonth((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1))}>
                                <ChevronRightRoundedIcon />
                            </IconButton>
                        </Stack>
                    </Stack>
                </Stack>

                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
                        gap: 1,
                    }}
                >
                    {WEEKDAY_LABELS.map((label) => (
                        <Typography
                            key={label}
                            sx={{
                                px: 1,
                                py: 0.4,
                                fontSize: '0.84rem',
                                fontWeight: 800,
                                letterSpacing: '0.08em',
                                textTransform: 'uppercase',
                                color: 'text.secondary',
                            }}
                        >
                            {label}
                        </Typography>
                    ))}

                    {calendarDays.map((day) => {
                        const hasOverdue = day.todos.some((todo) => !todo.completed && getDueDateState(todo.dueDate) === 'overdue');
                        const visibleTodos = day.todos.slice(0, 2);

                        return (
                            <Paper
                                key={day.isoDate}
                                sx={{
                                    minHeight: 170,
                                    p: 1,
                                    borderRadius: '18px',
                                    border: hasOverdue
                                        ? '1px solid rgba(211, 47, 47, 0.24)'
                                        : day.isToday
                                            ? '1px solid rgba(217, 103, 77, 0.22)'
                                            : '1px solid rgba(31, 64, 87, 0.08)',
                                    background: hasOverdue
                                        ? 'rgba(255, 244, 244, 0.95)'
                                        : day.isCurrentMonth
                                            ? 'rgba(255, 255, 255, 0.74)'
                                            : 'rgba(31, 64, 87, 0.03)',
                                    opacity: day.isCurrentMonth ? 1 : 0.68,
                                }}
                                variant="outlined"
                            >
                                <Stack spacing={0.8}>
                                    <Stack alignItems="center" direction="row" justifyContent="space-between" spacing={0.5}>
                                        <Typography
                                            sx={{
                                                fontWeight: day.isToday ? 800 : 700,
                                                color: day.isToday ? 'secondary.main' : 'text.primary',
                                            }}
                                        >
                                            {day.date.getDate()}
                                        </Typography>
                                        {!!day.todos.length && (
                                            <Chip
                                                color={hasOverdue ? 'error' : 'default'}
                                                label={day.todos.length}
                                                size="small"
                                                variant="outlined"
                                            />
                                        )}
                                    </Stack>

                                    <Stack spacing={0.8}>
                                        {visibleTodos.map((todo) => {
                                            const isOverdue = !todo.completed && getDueDateState(todo.dueDate) === 'overdue';

                                            return (
                                                <Paper
                                                    key={todo._id}
                                                    sx={{
                                                        p: 0.8,
                                                        borderRadius: '14px',
                                                        border: isOverdue
                                                            ? '1px solid rgba(211, 47, 47, 0.2)'
                                                            : '1px solid rgba(31, 64, 87, 0.08)',
                                                        background: isOverdue
                                                            ? 'rgba(255, 234, 232, 0.96)'
                                                            : 'rgba(255, 250, 244, 0.82)',
                                                    }}
                                                    variant="outlined"
                                                >
                                                    <Stack spacing={0.6}>
                                                        <ProjectChip project={todo.project} />
                                                        <Typography
                                                            sx={{
                                                                fontSize: '0.84rem',
                                                                fontWeight: 700,
                                                                lineHeight: 1.35,
                                                                textDecoration: todo.completed ? 'line-through' : 'none',
                                                                color: todo.completed ? 'text.secondary' : 'text.primary',
                                                            }}
                                                        >
                                                            {todo.todo}
                                                        </Typography>
                                                        <Stack direction="row" justifyContent="space-between" spacing={0.4}>
                                                            <Tooltip title={todo.completed ? 'Mark active' : 'Mark done'}>
                                                                <IconButton onClick={() => editStatus(todo._id)} size="small">
                                                                    {todo.completed ? <RadioButtonUncheckedRoundedIcon fontSize="small" /> : <TaskAltRoundedIcon fontSize="small" />}
                                                                </IconButton>
                                                            </Tooltip>
                                                            <Stack direction="row" spacing={0.2}>
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
                                        })}

                                        {!day.todos.length && (
                                            <Typography sx={{ color: 'text.secondary', fontSize: '0.82rem' }}>
                                                No due items
                                            </Typography>
                                        )}

                                        {day.todos.length > visibleTodos.length && (
                                            <Typography sx={{ color: 'text.secondary', fontSize: '0.78rem' }}>
                                                +{day.todos.length - visibleTodos.length} more task{day.todos.length - visibleTodos.length === 1 ? '' : 's'}
                                            </Typography>
                                        )}
                                    </Stack>
                                </Stack>
                            </Paper>
                        );
                    })}
                </Box>
            </Stack>
        </Paper>
    );
}

export default TodoCalendar;
