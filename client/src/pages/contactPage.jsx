import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import EmailRoundedIcon from '@mui/icons-material/EmailRounded';
import PhoneRoundedIcon from '@mui/icons-material/PhoneRounded';
import GitHubIcon from '@mui/icons-material/GitHub';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import FacebookRoundedIcon from '@mui/icons-material/FacebookRounded';

function ContactPage() {
    const cards = [
        {
            title: 'Email',
            value: 'shohamkatzav95@gmail.com',
            href: 'mailto:shohamkatzav95@gmail.com',
            icon: <EmailRoundedIcon color="secondary" />,
            action: 'Send an email',
        },
        {
            title: 'Phone',
            value: '052-3292847',
            href: 'tel:0523292847',
            icon: <PhoneRoundedIcon color="secondary" />,
            action: 'Call now',
        },
        {
            title: 'LinkedIn',
            value: 'Professional profile',
            href: 'https://www.linkedin.com/in/shoham-katzav/',
            icon: <LinkedInIcon color="secondary" />,
            action: 'Open LinkedIn',
        },
        {
            title: 'GitHub',
            value: 'More projects and code',
            href: 'https://github.com/ShohamKatzav/',
            icon: <GitHubIcon color="secondary" />,
            action: 'View GitHub',
        },
        {
            title: 'Facebook',
            value: 'Personal profile',
            href: 'https://www.facebook.com/shoham.katzav/',
            icon: <FacebookRoundedIcon color="secondary" />,
            action: 'Open Facebook',
        },
    ];

    return (
        <Box className="page-shell">
            <Paper className="surface-panel fade-in-up" sx={{ p: { xs: 2.2, md: 4 }, borderRadius: '36px' }}>
                <p className="eyebrow">Let&apos;s connect</p>
                <Typography className="page-title" sx={{ fontSize: { xs: '2.2rem', md: '3.6rem' } }} variant="h1">
                    Questions, feedback, or collaboration ideas are always welcome.
                </Typography>
                <Typography className="page-subtitle" sx={{ mt: 1.4 }}>
                    If something in the app could be better, or you just want to say hello, these are the fastest ways to reach out.
                </Typography>
            </Paper>

            <Grid container spacing={2.2}>
                {cards.map((card, index) => (
                    <Grid item key={card.title} md={index < 2 ? 6 : 4} xs={12}>
                        <Paper
                            className={`surface-panel fade-in-up stagger-${(index % 4) + 1}`}
                            sx={{ p: 2.4, borderRadius: '28px', height: '100%' }}
                        >
                            <Stack spacing={2} sx={{ height: '100%' }}>
                                <Box
                                    sx={{
                                        width: 52,
                                        height: 52,
                                        borderRadius: '18px',
                                        display: 'grid',
                                        placeItems: 'center',
                                        background: 'rgba(217, 103, 77, 0.12)',
                                    }}
                                >
                                    {card.icon}
                                </Box>
                                <Box sx={{ flexGrow: 1 }}>
                                    <Typography sx={{ fontWeight: 700, mb: 0.4 }} variant="h6">
                                        {card.title}
                                    </Typography>
                                    <Typography sx={{ color: 'text.secondary' }}>
                                        {card.value}
                                    </Typography>
                                </Box>
                                <Button
                                    color="secondary"
                                    component="a"
                                    fullWidth
                                    href={card.href}
                                    rel="noreferrer"
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
