import { Link } from 'react-router-dom';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import AutoFixHighRoundedIcon from '@mui/icons-material/AutoFixHighRounded';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import StorageRoundedIcon from '@mui/icons-material/StorageRounded';

function AboutPage() {
    const features = [
        {
            icon: <AutoFixHighRoundedIcon color="secondary" />,
            title: 'Clean task control',
            description: 'Material UI and the Data Grid power a faster create, edit, batch-update, and review flow without losing context.',
        },
        {
            icon: <LockRoundedIcon color="secondary" />,
            title: 'Protected identity',
            description: 'Auth0, JWT validation, and permission checks keep each workspace private to the signed-in user.',
        },
        {
            icon: <StorageRoundedIcon color="secondary" />,
            title: 'Reliable data layer',
            description: 'React, React Router, Axios, Express, and MongoDB work together to keep the interface quick and the API simple.',
        },
    ];

    const steps = [
        'Log in using Auth0 to enter your private workspace.',
        'Create your own todos or import a sample batch to get moving quickly.',
        'Edit content, toggle status, or batch-manage selected tasks from the table.',
        'Review progress and keep the list focused as priorities change.',
    ];

    return (
        <Box className="page-shell">
            <Paper className="surface-panel fade-in-up" sx={{ p: { xs: 2.2, md: 4 }, borderRadius: '36px' }}>
                <p className="eyebrow">Why this app exists</p>
                <Typography className="page-title" sx={{ fontSize: { xs: '2.3rem', md: '3.8rem' } }} variant="h1">
                    A focused task app built to feel simple, secure, and practical.
                </Typography>
                <Typography className="page-subtitle" sx={{ mt: 1.4 }}>
                    Todo Flow combines React and Vite on the frontend, Material UI for the interface, React Router for navigation, Axios for API calls, Express and MongoDB on the backend, and Auth0 for authentication.
                </Typography>

                <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mt: 2.5 }}>
                    <Chip label="React + Vite" variant="outlined" />
                    <Chip label="Material UI" variant="outlined" />
                    <Chip label="React Router" variant="outlined" />
                    <Chip label="Axios" variant="outlined" />
                    <Chip label="Express + Node" variant="outlined" />
                    <Chip label="MongoDB Atlas" variant="outlined" />
                    <Chip label="Auth0" variant="outlined" />
                </Stack>
            </Paper>

            <Paper className="surface-panel fade-in-up stagger-2" sx={{ p: { xs: 2.2, md: 3 }, borderRadius: '32px' }}>
                <Stack spacing={2.4}>
                    <Box>
                        <Typography sx={{ mb: 1.2 }} variant="h3">
                            Getting started
                        </Typography>
                        <Typography sx={{ color: 'text.secondary', maxWidth: '54ch' }}>
                            The workflow is intentionally straightforward: authenticate once, manage your own list, and let the interface stay out of your way.
                        </Typography>
                    </Box>
                    <Stack component="ol" spacing={1.2} sx={{ m: 0, pl: 2.6 }}>
                        {steps.map((step) => (
                            <Typography component="li" key={step} sx={{ color: 'text.secondary', pl: 0.4 }}>
                                {step}
                            </Typography>
                        ))}
                    </Stack>
                    <Typography sx={{ color: 'text.secondary' }}>
                        Questions or feedback? Visit <Link to="/contact">the contact page</Link> and let&apos;s keep improving it.
                    </Typography>
                </Stack>
            </Paper>

            <Grid container spacing={2.2}>
                {features.map((feature, index) => (
                    <Grid item key={feature.title} md={4} xs={12}>
                        <Paper
                            className={`surface-panel fade-in-up stagger-${index + 1}`}
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
                                {feature.icon}
                            </Box>
                            <Typography sx={{ fontWeight: 700, mb: 0.8 }} variant="h6">
                                {feature.title}
                            </Typography>
                            <Typography sx={{ color: 'text.secondary' }}>
                                {feature.description}
                            </Typography>
                        </Paper>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
}

export default AboutPage;
