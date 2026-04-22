import { Link } from 'react-router-dom';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import AutoFixHighRoundedIcon from '@mui/icons-material/AutoFixHighRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import FolderRoundedIcon from '@mui/icons-material/FolderRounded';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import StorageRoundedIcon from '@mui/icons-material/StorageRounded';
import ViewKanbanRoundedIcon from '@mui/icons-material/ViewKanbanRounded';

function AboutPage() {
    const pillars = [
        {
            icon: <FolderRoundedIcon color="secondary" />,
            title: 'Project-based flow',
            description: 'Tasks are no longer one long stack. Group work into projects, keep empty buckets ready, and reassign tasks when they land in the wrong place.',
        },
        {
            icon: <ViewKanbanRoundedIcon color="secondary" />,
            title: 'Multiple work views',
            description: 'List, board, and calendar views all sit on the same data, so you can inspect work by detail, momentum, or schedule without duplicating effort.',
        },
        {
            icon: <CalendarMonthRoundedIcon color="secondary" />,
            title: 'Deadline visibility',
            description: 'Overdue work is intentionally louder with spotlight cards, tinted rows, and due-date cues that push urgent tasks toward the top.',
        },
        {
            icon: <LockRoundedIcon color="secondary" />,
            title: 'Protected identity',
            description: 'Auth0, JWT validation, and permission checks keep each workspace private to the signed-in user.',
        },
        {
            icon: <StorageRoundedIcon color="secondary" />,
            title: 'Simple full-stack core',
            description: 'React, Vite, Axios, Express, and MongoDB keep the app approachable while still leaving room to grow into a richer workspace product.',
        },
        {
            icon: <AutoFixHighRoundedIcon color="secondary" />,
            title: 'Import-ready workflow',
            description: 'Excel import, preview, export, and sample task generation make it easy to seed or reshape a workspace instead of starting from zero.',
        },
    ];

    const roadmap = [
        'Sign in to enter a private workspace.',
        'Create or manage projects before tasks pile into one flat list.',
        'Add tasks, import them from Excel, or pull sample items to shape the workspace quickly.',
        'Switch between list, board, and calendar depending on whether you want detail, flow, or schedule.',
        'Use overdue signals and project filters to decide what deserves attention next.',
    ];

    return (
        <Box className="page-shell">
            <Paper className="surface-panel fade-in-up" sx={{ p: { xs: 2.2, md: 4 }, borderRadius: '36px' }}>
                <Stack direction={{ xs: 'column', lg: 'row' }} justifyContent="space-between" spacing={2.2}>
                    <Box sx={{ flex: 1 }}>
                        <p className="eyebrow">What Todo Flow Is Becoming</p>
                        <Typography
                            className="page-title"
                            sx={{ fontSize: { xs: '2.3rem', md: '3.35rem' }, maxWidth: { xs: '11ch', md: '18ch' } }}
                            variant="h1"
                        >
                            A personal work workspace, not just another todo list.
                        </Typography>
                    </Box>
                    <Box sx={{ flex: 1, maxWidth: 580 }}>
                        <Typography className="page-subtitle" sx={{ mt: { xs: 0.4, lg: 0.9 }, maxWidth: '66ch' }}>
                            Todo Flow started as a clean React, Express, MongoDB, and Auth0 task app. It is now growing into a small project workspace with managed projects, multiple planning views, and stronger deadline visibility.
                        </Typography>

                        <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mt: 2.1 }}>
                            <Chip label="React + Vite" variant="outlined" />
                            <Chip label="Material UI" variant="outlined" />
                            <Chip label="React Router" variant="outlined" />
                            <Chip label="Axios" variant="outlined" />
                            <Chip label="Express + Node" variant="outlined" />
                            <Chip label="MongoDB Atlas" variant="outlined" />
                            <Chip label="Auth0" variant="outlined" />
                            <Chip color="secondary" label="Projects + Board + Calendar" variant="outlined" />
                        </Stack>
                    </Box>
                </Stack>
            </Paper>

            <Grid container spacing={2.2}>
                <Grid item lg={7} xs={12}>
                    <Paper className="surface-panel fade-in-up stagger-2" sx={{ p: { xs: 2.2, md: 3 }, borderRadius: '32px', height: '100%' }}>
                        <Stack spacing={2.2}>
                            <Box>
                                <Typography sx={{ mb: 1.1 }} variant="h3">
                                    How it works
                                </Typography>
                                <Typography sx={{ color: 'text.secondary', maxWidth: '58ch' }}>
                                    The workflow is meant to stay fast: organize by project first, then choose the view that best matches the kind of thinking you need.
                                </Typography>
                            </Box>
                            <Stack component="ol" spacing={1.2} sx={{ m: 0, pl: 2.6 }}>
                                {roadmap.map((step) => (
                                    <Typography component="li" key={step} sx={{ color: 'text.secondary', pl: 0.4 }}>
                                        {step}
                                    </Typography>
                                ))}
                            </Stack>
                            <Typography sx={{ color: 'text.secondary' }}>
                                Questions or feedback? Visit <Link to="/contact">the contact page</Link> and keep shaping the next version.
                            </Typography>
                        </Stack>
                    </Paper>
                </Grid>
                <Grid item lg={5} xs={12}>
                    <Paper
                        className="surface-panel fade-in-up stagger-3"
                        sx={{
                            p: { xs: 2.2, md: 3 },
                            borderRadius: '32px',
                            height: '100%',
                            background: 'linear-gradient(180deg, rgba(255, 247, 242, 0.95), rgba(255, 252, 247, 0.86))',
                        }}
                    >
                        <Stack spacing={1.2}>
                            <Typography variant="h4">Current direction</Typography>
                            <Typography sx={{ color: 'text.secondary' }}>
                                The app is moving toward a compact planning tool for personal projects, study flows, content pipelines, and small operational work.
                            </Typography>
                            <Paper
                                sx={{
                                    p: 1.6,
                                    borderRadius: '22px',
                                    border: '1px solid rgba(217, 103, 77, 0.14)',
                                    background: 'rgba(217, 103, 77, 0.08)',
                                }}
                                variant="outlined"
                            >
                                <Typography sx={{ fontWeight: 700, mb: 0.5 }}>
                                    Why that matters
                                </Typography>
                                <Typography sx={{ color: 'text.secondary' }}>
                                    A checklist is useful, but a workspace gives context: where work belongs, when it is due, and how it is moving.
                                </Typography>
                            </Paper>
                        </Stack>
                    </Paper>
                </Grid>
            </Grid>

            <Grid container spacing={2.2}>
                {pillars.map((pillar, index) => (
                    <Grid item key={pillar.title} md={6} xl={4} xs={12}>
                        <Paper
                            className={`surface-panel fade-in-up stagger-${(index % 4) + 1}`}
                            sx={{ p: 2.4, borderRadius: '28px', height: '100%' }}
                        >
                            <Box
                                sx={{
                                    width: 54,
                                    height: 54,
                                    borderRadius: '18px',
                                    display: 'grid',
                                    placeItems: 'center',
                                    background: 'rgba(217, 103, 77, 0.12)',
                                    mb: 2,
                                }}
                            >
                                {pillar.icon}
                            </Box>
                            <Typography sx={{ fontWeight: 700, mb: 0.8 }} variant="h6">
                                {pillar.title}
                            </Typography>
                            <Typography sx={{ color: 'text.secondary' }}>
                                {pillar.description}
                            </Typography>
                        </Paper>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
}

export default AboutPage;
