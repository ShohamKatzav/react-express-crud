import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth0 } from "@auth0/auth0-react";
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import ChecklistRoundedIcon from '@mui/icons-material/ChecklistRounded';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import LoginButton from './loginButton';
import './Navbar.css';
import ProfileButton from './profileButton';

function Navbar() {
    const { isAuthenticated, isLoading } = useAuth0();
    const [mobileOpen, setMobileOpen] = useState(false);
    const navItems = [
        { label: 'Home', path: '/' },
        { label: 'Contact', path: '/contact' },
        { label: 'About', path: '/about' },
    ];

    const renderLinks = (isMobile = false) => (
        <Box className={isMobile ? "navbar-links navbar-links--mobile" : "navbar-links"}>
            {navItems.map((item) => (
                <NavLink
                    key={item.path}
                    className={({ isActive }) =>
                        `navbar-link${isActive ? ' navbar-link--active' : ''}${isMobile ? ' navbar-link--mobile' : ''}`
                    }
                    end={item.path === '/'}
                    onClick={() => setMobileOpen(false)}
                    to={item.path}
                >
                    {item.label}
                </NavLink>
            ))}
        </Box>
    );

    return isLoading ? null : (
        <>
            <AppBar
                className="navbar-shell"
                elevation={0}
                position="sticky"
            >
                <Container maxWidth="lg">
                    <Toolbar disableGutters sx={{ minHeight: { xs: 78, md: 92 } }}>
                        <Stack alignItems="center" direction="row" spacing={1.5} sx={{ flexGrow: 1 }}>
                            <Box className="brand-mark">
                                <ChecklistRoundedIcon sx={{ color: 'secondary.main', fontSize: '1.55rem' }} />
                            </Box>
                            <Box>
                                <NavLink className="brand-title" to="/">
                                    Todo Flow
                                </NavLink>
                                <Typography className="brand-caption">
                                    A clearer way to manage your day
                                </Typography>
                            </Box>
                            {isAuthenticated && (
                                <Chip
                                    className="brand-chip"
                                    color="secondary"
                                    label="Protected workspace"
                                    size="small"
                                    variant="outlined"
                                />
                            )}
                        </Stack>

                        <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                            {renderLinks()}
                        </Box>

                        <Stack alignItems="center" direction="row" spacing={1.2} sx={{ ml: 1.5 }}>
                            <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                                {isAuthenticated ? (
                                    <ProfileButton />
                                ) : (
                                    <LoginButton label="Enter Workspace" />
                                )}
                            </Box>
                            <IconButton
                                className="mobile-nav-toggle"
                                color="inherit"
                                onClick={() => setMobileOpen(true)}
                                sx={{ display: { md: 'none' } }}
                            >
                                <MenuRoundedIcon />
                            </IconButton>
                        </Stack>
                    </Toolbar>
                </Container>
            </AppBar>

            <Drawer
                anchor="right"
                onClose={() => setMobileOpen(false)}
                open={mobileOpen}
                PaperProps={{
                    sx: {
                        width: 310,
                        p: 2.2,
                        background: 'linear-gradient(180deg, rgba(31, 64, 87, 0.98), rgba(19, 39, 55, 0.95))',
                        color: '#fffaf4',
                    },
                }}
            >
                <Stack spacing={2}>
                    <Box>
                        <Typography sx={{ fontFamily: '"Palatino Linotype", Georgia, serif', fontSize: '1.65rem', fontWeight: 700 }}>
                            Todo Flow
                        </Typography>
                        <Typography sx={{ color: 'rgba(255, 250, 244, 0.72)' }}>
                            Keep your priorities clear and in view.
                        </Typography>
                    </Box>
                    <Divider sx={{ borderColor: 'rgba(255, 250, 244, 0.12)' }} />
                    {renderLinks(true)}
                    <Divider sx={{ borderColor: 'rgba(255, 250, 244, 0.12)' }} />
                    {isAuthenticated ? (
                        <ProfileButton forceLabel />
                    ) : (
                        <LoginButton fullWidth label="Log In" size="large" />
                    )}
                </Stack>
            </Drawer>
        </>
    );
}

export default Navbar;
