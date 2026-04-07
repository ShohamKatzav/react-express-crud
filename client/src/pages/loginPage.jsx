import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import ShieldRoundedIcon from '@mui/icons-material/ShieldRounded';
import ViewKanbanRoundedIcon from '@mui/icons-material/ViewKanbanRounded';
import LoginButton from "../components/loginButton"

const LoginPage = () => {
    const highlights = [
        {
            icon: <AutoAwesomeRoundedIcon color="secondary" />,
            title: "Focused flow",
            description: "Capture ideas quickly, organize them cleanly, and keep the next step obvious.",
        },
        {
            icon: <ShieldRoundedIcon color="secondary" />,
            title: "Private by default",
            description: "Auth0-backed access keeps every list tied to the right person and workspace.",
        },
        {
            icon: <ViewKanbanRoundedIcon color="secondary" />,
            title: "Action-ready board",
            description: "Create, edit, batch-update, and clear tasks without bouncing between screens.",
        },
    ];

    return (
        <Box className="page-shell">
            <Paper
                className="surface-panel fade-in-up"
                sx={{
                    p: { xs: 2.2, md: 4 },
                    borderRadius: '36px',
                    overflow: 'hidden',
                }}
            >
                <Stack direction={{ xs: 'column', lg: 'row' }} spacing={{ xs: 3, lg: 4 }}>
                    <Box sx={{ flex: 1 }}>
                        <p className="eyebrow">Personal planning studio</p>
                        <Typography className="page-title" sx={{ fontSize: { xs: '2.5rem', md: '4.2rem' } }} variant="h1">
                            Keep your task list sharp, calm, and beautifully organized.
                        </Typography>
                        <Typography className="page-subtitle" sx={{ mt: 1.5 }}>
                            Sign in to open your protected workspace, manage personal todos, and move through the day with less clutter.
                        </Typography>
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.4} sx={{ mt: 3 }}>
                            <LoginButton
                                label="Log In to Your Workspace"
                                size="large"
                                sx={{ minWidth: { sm: 250 } }}
                            />
                            <Chip
                                color="primary"
                                label="Auth0 secured"
                                sx={{ px: 1, py: 2.8 }}
                                variant="outlined"
                            />
                        </Stack>
                    </Box>

                    <Stack spacing={1.4} sx={{ flex: 1 }}>
                        {highlights.map((item, index) => (
                            <Paper
                                key={item.title}
                                className={`fade-in-up stagger-${index + 1}`}
                                sx={{
                                    p: 2.1,
                                    borderRadius: '24px',
                                    border: '1px solid rgba(31, 64, 87, 0.08)',
                                    background: 'rgba(255, 250, 244, 0.82)',
                                }}
                                variant="outlined"
                            >
                                <Stack direction="row" spacing={1.4}>
                                    <Box
                                        sx={{
                                            width: 48,
                                            height: 48,
                                            borderRadius: '18px',
                                            display: 'grid',
                                            placeItems: 'center',
                                            background: 'rgba(217, 103, 77, 0.12)',
                                            flexShrink: 0,
                                        }}
                                    >
                                        {item.icon}
                                    </Box>
                                    <Box>
                                        <Typography sx={{ fontWeight: 700, mb: 0.35 }}>{item.title}</Typography>
                                        <Typography sx={{ color: 'text.secondary' }}>{item.description}</Typography>
                                    </Box>
                                </Stack>
                            </Paper>
                        ))}
                    </Stack>
                </Stack>
            </Paper>
        </Box>
    );
};

export default LoginPage;
