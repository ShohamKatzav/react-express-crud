import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { useAuth0 } from "@auth0/auth0-react";
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import InsightsRoundedIcon from '@mui/icons-material/InsightsRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import LoginPage from './loginPage';
import ProjectChip from '../components/projectChip';
import { DEFAULT_PROJECT, getDueDateState, normalizeProjectValue, sortTodosByUrgency } from '../utils/todoFields';

const normalizeTodoRecord = (todo) => ({
    ...todo,
    project: normalizeProjectValue(todo?.project),
    priority: todo?.priority || 'medium',
    dueDate: todo?.dueDate || '',
});

const normalizeProjectRecord = (project) => ({
    ...project,
    name: normalizeProjectValue(project?.name),
    tasksCount: Number(project?.tasksCount || 0),
    isDefault: Boolean(project?.isDefault),
});

function DashboardPage() {
    const baseUrl = import.meta.env.VITE_APP_BASE_URL;
    const { isAuthenticated, getAccessTokenSilently, isLoading } = useAuth0();
    const [todos, setTodos] = useState([]);
    const [projects, setProjects] = useState([]);
    const [isDashboardLoading, setIsDashboardLoading] = useState(false);

    useEffect(() => {
        const loadDashboard = async () => {
            if (!isAuthenticated) {
                return;
            }

            setIsDashboardLoading(true);
            try {
                const accessToken = await getAccessTokenSilently();
                const config = {
                    headers: { Authorization: `Bearer ${accessToken}` }
                };

                const [todoResponse, projectResponse] = await Promise.all([
                    api.get(`/todo`, config),
                    api.get(`/projects`, config),
                ]);

                setTodos(todoResponse.data.map(normalizeTodoRecord));
                setProjects(projectResponse.data.map(normalizeProjectRecord));
            } catch (error) {
                console.log(error.message);
            } finally {
                setIsDashboardLoading(false);
            }
        };

        loadDashboard();
    }, [baseUrl, getAccessTokenSilently, isAuthenticated]);

    if (isLoading || isDashboardLoading) {
        return (
            <Box className="page-shell">
                <Paper className="surface-panel fade-in-up" sx={{ p: 4, borderRadius: '36px', textAlign: 'center' }}>
                    <Stack alignItems="center" spacing={2}>
                        <CircularProgress color="secondary" />
                        <Typography variant="h5">Loading your dashboard...</Typography>
                    </Stack>
                </Paper>
            </Box>
        );
    }

    if (!isAuthenticated) {
        return <LoginPage />;
    }

    const totalTodos = todos.length;
    const completedTodos = todos.filter((todo) => todo.completed).length;
    const activeTodos = totalTodos - completedTodos;
    const overdueTodos = todos.filter((todo) => !todo.completed && getDueDateState(todo.dueDate) === 'overdue').length;
    const todayTodos = todos.filter((todo) => !todo.completed && getDueDateState(todo.dueDate) === 'today').length;
    const upcomingTodos = todos.filter((todo) => !todo.completed && getDueDateState(todo.dueDate) === 'upcoming').length;
    const unscheduledTodos = todos.filter((todo) => !todo.dueDate).length;
    const completionRate = totalTodos ? Math.round((completedTodos / totalTodos) * 100) : 0;
    const urgentTodos = sortTodosByUrgency(todos.filter((todo) => !todo.completed)).slice(0, 5);
    const orderedProjects = [...projects]
        .sort((projectA, projectB) => projectB.tasksCount - projectA.tasksCount || projectA.name.localeCompare(projectB.name))
        .slice(0, 5);

    const chartStats = [
        { label: 'Overdue', value: overdueTodos, color: '#d32f2f' },
        { label: 'Today', value: todayTodos, color: '#d9674d' },
        { label: 'Upcoming', value: upcomingTodos, color: '#3b82b4' },
        { label: 'No date', value: unscheduledTodos, color: '#7a8a96' },
    ];
    const maxTimelineValue = Math.max(...chartStats.map((item) => item.value), 1);

    return (
        <Box className="page-shell">
            <Paper className="surface-panel fade-in-up" sx={{ p: { xs: 2.2, md: 3.2 }, borderRadius: '36px' }}>
                <Stack direction={{ xs: 'column', xl: 'row' }} spacing={2.8}>
                    <Box sx={{ flex: 1 }}>
                        <p className="eyebrow">Dashboard</p>
                        <Typography
                            className="page-title"
                            sx={{ fontSize: { xs: '2.3rem', md: '3.6rem' }, maxWidth: { xs: '11ch', md: '15ch' } }}
                            variant="h1"
                        >
                            See the shape of your work before you enter the workspace.
                        </Typography>
                        <Typography className="page-subtitle" sx={{ mt: 1.35, maxWidth: '60ch' }}>
                            Use this page for signal: what is slipping, how your projects are distributed, and where the next click should take you.
                        </Typography>
                        <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mt: 2.2 }}>
                            <Chip label={`${projects.length || 1} project${projects.length === 1 ? '' : 's'}`} variant="outlined" />
                            <Chip color="secondary" label={`${activeTodos} in focus`} variant="outlined" />
                            <Chip color="error" label={`${overdueTodos} overdue`} variant="outlined" />
                            <Chip color="success" label={`${completedTodos} done`} variant="outlined" />
                        </Stack>
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.2} sx={{ mt: 2.8 }}>
                            <Button
                                color="secondary"
                                component={Link}
                                endIcon={<ArrowForwardRoundedIcon />}
                                size="large"
                                to="/workspace"
                                variant="contained"
                            >
                                Open workspace
                            </Button>
                            <Button component={Link} size="large" to="/about" variant="outlined">
                                Why this app is changing
                            </Button>
                        </Stack>
                    </Box>

                    <Paper
                        sx={{
                            p: 2,
                            borderRadius: '28px',
                            border: '1px solid rgba(31, 64, 87, 0.08)',
                            background: 'rgba(255, 248, 240, 0.7)',
                            minWidth: { xl: 300 },
                        }}
                        variant="outlined"
                    >
                        <Stack spacing={1.4}>
                            <Stack alignItems="center" direction="row" justifyContent="space-between" spacing={1}>
                                <Typography sx={{ fontWeight: 700 }}>Completion</Typography>
                                <Chip color="secondary" label={`${completionRate}%`} size="small" variant="outlined" />
                            </Stack>
                            <ProgressRing progress={completionRate} />
                            <Typography sx={{ color: 'text.secondary', fontSize: '0.95rem' }}>
                                {completedTodos} of {totalTodos} tasks are complete. {overdueTodos ? `${overdueTodos} are overdue.` : 'Nothing is overdue right now.'}
                            </Typography>
                        </Stack>
                    </Paper>
                </Stack>
            </Paper>

            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', xl: '1.25fr 1fr' },
                    gap: 1.8,
                }}
            >
                <Paper className="surface-panel fade-in-up stagger-2" sx={{ p: { xs: 2, md: 2.4 }, borderRadius: '30px' }}>
                    <Stack spacing={1.7}>
                        <Stack alignItems="center" direction="row" justifyContent="space-between" spacing={1}>
                            <Box>
                                <Typography variant="h4">Workload timeline</Typography>
                                <Typography sx={{ color: 'text.secondary', mt: 0.45 }}>
                                    A quick read on how due dates are stacking up.
                                </Typography>
                            </Box>
                            <InsightsRoundedIcon sx={{ color: '#d9674d' }} />
                        </Stack>
                        <Stack direction={{ xs: 'column', lg: 'row' }} spacing={2}>
                            <Box sx={{ flex: 1 }}>
                                {chartStats.map((item) => (
                                    <Stack key={item.label} spacing={0.45} sx={{ mb: 1.15 }}>
                                        <Stack alignItems="center" direction="row" justifyContent="space-between">
                                            <Typography sx={{ fontWeight: 700 }}>{item.label}</Typography>
                                            <Typography sx={{ color: 'text.secondary' }}>{item.value}</Typography>
                                        </Stack>
                                        <Box
                                            sx={{
                                                height: 11,
                                                borderRadius: 999,
                                                background: 'rgba(31, 64, 87, 0.08)',
                                                overflow: 'hidden',
                                            }}
                                        >
                                            <Box
                                                sx={{
                                                    width: `${(item.value / maxTimelineValue) * 100}%`,
                                                    height: '100%',
                                                    borderRadius: 999,
                                                    background: item.color,
                                                }}
                                            />
                                        </Box>
                                    </Stack>
                                ))}
                            </Box>
                            <Paper
                                sx={{
                                    p: 1.4,
                                    borderRadius: '22px',
                                    border: '1px solid rgba(211, 47, 47, 0.12)',
                                    background: 'rgba(255, 245, 244, 0.78)',
                                    minWidth: { lg: 250 },
                                }}
                                variant="outlined"
                            >
                                <Stack spacing={0.8}
                                    sx={{
                                        height: '100%',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'space-between',
                                    }}>
                                    <Stack>
                                        <Stack direction="row" spacing={1} display="flex" flex-direction="column" height="100%">
                                            <WarningAmberRoundedIcon color="error" />
                                            <Typography sx={{ fontWeight: 700 }}>Urgent slice</Typography>
                                        </Stack>
                                        <Typography sx={{ color: 'text.secondary' }}>
                                            {overdueTodos
                                                ? `${overdueTodos} task${overdueTodos === 1 ? '' : 's'} are overdue and ${todayTodos} land today.`
                                                : `Nothing is overdue. ${todayTodos} task${todayTodos === 1 ? '' : 's'} land today.`}
                                        </Typography>
                                    </Stack>
                                    <Button component={Link} size="small" to="/workspace?status=overdue" variant="outlined" sx={{ mt: 'auto' }}>
                                        Review in workspace
                                    </Button>
                                </Stack>
                            </Paper>
                        </Stack>
                    </Stack>
                </Paper>

                <Paper className="surface-panel fade-in-up stagger-3" sx={{ p: { xs: 2, md: 2.4 }, borderRadius: '30px' }}>
                    <Stack spacing={1.6}>
                        <Stack alignItems="center" direction="row" justifyContent="space-between" spacing={1}>
                            <Box>
                                <Typography variant="h4">Projects at a glance</Typography>
                                <Typography sx={{ color: 'text.secondary', mt: 0.45 }}>
                                    The busiest buckets in your workspace.
                                </Typography>
                            </Box>
                            <CalendarMonthRoundedIcon sx={{ color: '#1f4057' }} />
                        </Stack>
                        <Stack spacing={1}>
                            {(orderedProjects.length ? orderedProjects : [{ _id: DEFAULT_PROJECT, name: DEFAULT_PROJECT, tasksCount: 0 }]).map((project) => {
                                const width = totalTodos ? Math.max((project.tasksCount / totalTodos) * 100, 10) : 10;

                                return (
                                    <Paper
                                        key={project._id || project.name}
                                        sx={{
                                            p: 1.2,
                                            borderRadius: '18px',
                                            border: '1px solid rgba(31, 64, 87, 0.08)',
                                            background: 'rgba(255, 255, 255, 0.72)',
                                        }}
                                        variant="outlined"
                                    >
                                        <Stack spacing={0.7}>
                                            <Stack alignItems="center" direction="row" justifyContent="space-between" spacing={1}>
                                                <ProjectChip project={project.name} />
                                                <Typography sx={{ color: 'text.secondary', fontWeight: 700 }}>
                                                    {project.tasksCount}
                                                </Typography>
                                            </Stack>
                                            <Box
                                                sx={{
                                                    height: 10,
                                                    borderRadius: 999,
                                                    background: 'rgba(31, 64, 87, 0.08)',
                                                    overflow: 'hidden',
                                                }}
                                            >
                                                <Box
                                                    sx={{
                                                        width: `${width}%`,
                                                        height: '100%',
                                                        borderRadius: 999,
                                                        background: 'linear-gradient(90deg, rgba(217, 103, 77, 0.94), rgba(31, 64, 87, 0.85))',
                                                    }}
                                                />
                                            </Box>
                                        </Stack>
                                    </Paper>
                                );
                            })}
                        </Stack>
                    </Stack>
                </Paper>
            </Box>

            <Paper className="surface-panel fade-in-up stagger-4" sx={{ p: { xs: 2, md: 2.4 }, borderRadius: '30px' }}>
                <Stack spacing={1.5}>
                    <Stack direction={{ xs: 'column', lg: 'row' }} justifyContent="space-between" spacing={1.4}>
                        <Box>
                            <Typography variant="h4">Next tasks to review</Typography>
                            <Typography sx={{ color: 'text.secondary', mt: 0.45 }}>
                                The highest-pressure tasks are surfaced here, then one click takes you into the full workspace.
                            </Typography>
                        </Box>
                        <Button
                            color="secondary"
                            component={Link}
                            endIcon={<ArrowForwardRoundedIcon />}
                            to="/workspace"
                            variant="contained"
                        >
                            Go to workspace
                        </Button>
                    </Stack>

                    {urgentTodos.length ? (
                        <Box
                            sx={{
                                display: 'grid',
                                gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))', xl: 'repeat(4, minmax(0, 1fr))' },
                                gap: 1.1,
                            }}
                        >
                            {urgentTodos.map((todo) => (
                                <Paper
                                    key={todo._id}
                                    sx={{
                                        p: 1.2,
                                        borderRadius: '18px',
                                        border: getDueDateState(todo.dueDate) === 'overdue'
                                            ? '1px solid rgba(211, 47, 47, 0.2)'
                                            : '1px solid rgba(31, 64, 87, 0.08)',
                                        background: getDueDateState(todo.dueDate) === 'overdue'
                                            ? 'rgba(255, 242, 240, 0.92)'
                                            : 'rgba(255, 255, 255, 0.72)',
                                    }}
                                    variant="outlined"
                                >
                                    <Stack spacing={0.7}>
                                        <Stack direction="row" flexWrap="wrap" gap={0.7}>
                                            <ProjectChip project={todo.project} />
                                            <Chip
                                                color={getDueDateState(todo.dueDate) === 'overdue' ? 'error' : getDueDateState(todo.dueDate) === 'today' ? 'secondary' : 'default'}
                                                label={todo.dueDate || 'No date'}
                                                size="small"
                                                variant={getDueDateState(todo.dueDate) === 'overdue' ? 'filled' : 'outlined'}
                                            />
                                        </Stack>
                                        <Typography sx={{ fontWeight: 700, lineHeight: 1.45 }}>
                                            {todo.todo}
                                        </Typography>
                                    </Stack>
                                </Paper>
                            ))}
                        </Box>
                    ) : (
                        <Typography sx={{ color: 'text.secondary' }}>
                            No active tasks yet. Open the workspace to add your first one.
                        </Typography>
                    )}
                </Stack>
            </Paper>
        </Box>
    );
}

function ProgressRing({ progress }) {
    const normalizedProgress = Math.max(0, Math.min(progress, 100));
    const radius = 56;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (normalizedProgress / 100) * circumference;

    return (
        <Box sx={{ display: 'grid', placeItems: 'center', py: 0.5 }}>
            <Box sx={{ position: 'relative', width: 160, height: 160 }}>
                <svg height="160" width="160">
                    <circle
                        cx="80"
                        cy="80"
                        fill="transparent"
                        r={radius}
                        stroke="rgba(31, 64, 87, 0.08)"
                        strokeWidth="12"
                    />
                    <circle
                        cx="80"
                        cy="80"
                        fill="transparent"
                        r={radius}
                        stroke="#d9674d"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        strokeWidth="12"
                        transform="rotate(-90 80 80)"
                    />
                </svg>
                <Stack
                    alignItems="center"
                    justifyContent="center"
                    spacing={0.2}
                    sx={{ position: 'absolute', inset: 0 }}
                >
                    <Typography sx={{ fontSize: '2.2rem', fontWeight: 800, lineHeight: 1 }}>
                        {normalizedProgress}%
                    </Typography>
                    <Typography sx={{ color: 'text.secondary' }}>
                        completed
                    </Typography>
                </Stack>
            </Box>
        </Box>
    );
}

export default DashboardPage;
