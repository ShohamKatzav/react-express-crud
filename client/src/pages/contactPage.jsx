import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import EmailRoundedIcon from '@mui/icons-material/EmailRounded';
import FacebookRoundedIcon from '@mui/icons-material/FacebookRounded';
import GitHubIcon from '@mui/icons-material/GitHub';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import PhoneRoundedIcon from '@mui/icons-material/PhoneRounded';
import SendRoundedIcon from '@mui/icons-material/SendRounded';

function ContactPage() {
    const cards = [
        {
            title: 'Email',
            value: 'shohamkatzav95@gmail.com',
            href: 'mailto:shohamkatzav95@gmail.com',
            icon: <EmailRoundedIcon color="secondary" />,
            action: 'Send email',
            helper: 'Best for product ideas, bugs, and collaboration.',
            accent: 'rgba(217, 103, 77, 0.12)',
        },
        {
            title: 'Phone',
            value: '052-3292847',
            href: 'tel:0523292847',
            icon: <PhoneRoundedIcon color="secondary" />,
            action: 'Call now',
            helper: 'Fastest route for direct communication.',
            accent: 'rgba(63, 138, 105, 0.1)',
        },
        {
            title: 'LinkedIn',
            value: 'Professional profile',
            href: 'https://www.linkedin.com/in/shoham-katzav/',
            icon: <LinkedInIcon color="secondary" />,
            action: 'Open LinkedIn',
            helper: 'For networking, background, and professional contact.',
            accent: 'rgba(43, 108, 176, 0.1)',
        },
        {
            title: 'GitHub',
            value: 'More projects and code',
            href: 'https://github.com/ShohamKatzav/',
            icon: <GitHubIcon color="secondary" />,
            action: 'View GitHub',
            helper: 'See code, side projects, and implementation style.',
            accent: 'rgba(31, 64, 87, 0.08)',
        },
        {
            title: 'Facebook',
            value: 'Personal profile',
            href: 'https://www.facebook.com/shoham.katzav/',
            icon: <FacebookRoundedIcon color="secondary" />,
            action: 'Open Facebook',
            helper: 'A more casual social channel.',
            accent: 'rgba(119, 93, 208, 0.09)',
        },
    ];

    return (
        <Box className="page-shell">
            <Paper className="surface-panel fade-in-up" sx={{ p: { xs: 2.2, md: 3 }, borderRadius: '36px', overflow: 'hidden' }}>
                <Stack spacing={1.8}>
                    <p className="eyebrow">Let&apos;s connect</p>
                    <Stack direction={{ xs: 'column', lg: 'row' }} justifyContent="space-between" spacing={2}>
                        <Box sx={{ flex: 1, maxWidth: 760 }}>
                            <Typography
                                className="page-title"
                                sx={{ fontSize: { xs: '2.15rem', md: '3.1rem' }, maxWidth: { xs: '14ch', md: '20ch' } }}
                                variant="h1"
                            >
                                Questions, feedback, or collaboration ideas are welcome.
                            </Typography>
                            <Typography className="page-subtitle" sx={{ mt: 1.1, maxWidth: '60ch' }}>
                                If something in the app could be better, or you want to talk about the product, the code, or future ideas, these are the easiest ways to reach out.
                            </Typography>
                        </Box>

                        <Paper
                            sx={{
                                p: 1.4,
                                borderRadius: '24px',
                                border: '1px solid rgba(31, 64, 87, 0.08)',
                                background: 'linear-gradient(180deg, rgba(255, 247, 242, 0.94), rgba(255, 252, 247, 0.84))',
                                minWidth: { lg: 320 },
                            }}
                            variant="outlined"
                        >
                            <Stack spacing={1}>
                                <Stack alignItems="center" direction="row" spacing={1}>
                                    <Box
                                        sx={{
                                            width: 42,
                                            height: 42,
                                            borderRadius: '16px',
                                            display: 'grid',
                                            placeItems: 'center',
                                            background: 'rgba(217, 103, 77, 0.14)',
                                        }}
                                    >
                                        <SendRoundedIcon color="secondary" />
                                    </Box>
                                    <Box>
                                        <Typography sx={{ fontWeight: 800 }}>Best first step</Typography>
                                        <Typography sx={{ color: 'text.secondary', fontSize: '0.92rem' }}>
                                            Email is the cleanest channel for most requests.
                                        </Typography>
                                    </Box>
                                </Stack>
                                <Button
                                    color="secondary"
                                    component="a"
                                    href="mailto:shohamkatzav95@gmail.com"
                                    startIcon={<EmailRoundedIcon />}
                                    variant="contained"
                                >
                                    Email Shoham
                                </Button>
                            </Stack>
                        </Paper>
                    </Stack>

                    <Stack direction="row" flexWrap="wrap" gap={1}>
                        <Chip label="Product feedback" variant="outlined" />
                        <Chip label="Bug reports" variant="outlined" />
                        <Chip label="Collaboration" variant="outlined" />
                    </Stack>
                </Stack>
            </Paper>

            <Grid container spacing={2.2}>
                {cards.map((card, index) => (
                    <Grid item key={card.title} lg={index < 2 ? 6 : 4} xs={12}>
                        <Paper
                            className={`surface-panel fade-in-up stagger-${(index % 4) + 1}`}
                            sx={{ p: 2.2, borderRadius: '28px', height: '100%' }}
                        >
                            <Stack spacing={1.8} sx={{ height: '100%' }}>
                                <Stack alignItems="center" direction="row" spacing={1.2}>
                                    <Box
                                        sx={{
                                            width: 52,
                                            height: 52,
                                            borderRadius: '18px',
                                            display: 'grid',
                                            placeItems: 'center',
                                            background: card.accent,
                                            flexShrink: 0,
                                        }}
                                    >
                                        {card.icon}
                                    </Box>
                                    <Box>
                                        <Typography sx={{ fontWeight: 800 }} variant="h6">
                                            {card.title}
                                        </Typography>
                                        <Typography sx={{ color: 'text.secondary', fontSize: '0.95rem' }}>
                                            {card.helper}
                                        </Typography>
                                    </Box>
                                </Stack>

                                <Paper
                                    sx={{
                                        p: 1.3,
                                        borderRadius: '18px',
                                        border: '1px solid rgba(31, 64, 87, 0.08)',
                                        background: 'rgba(255, 255, 255, 0.7)',
                                    }}
                                    variant="outlined"
                                >
                                    <Typography sx={{ fontWeight: 700, overflowWrap: 'anywhere' }}>
                                        {card.value}
                                    </Typography>
                                </Paper>

                                <Button
                                    color="secondary"
                                    component="a"
                                    fullWidth
                                    href={card.href}
                                    rel="noreferrer"
                                    startIcon={card.icon}
                                    target={card.href.startsWith('http') ? '_blank' : undefined}
                                    variant="contained"
                                >
                                    {card.action}
                                </Button>
                            </Stack>
                        </Paper>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
}

export default ContactPage;
