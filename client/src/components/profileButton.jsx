import { useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { Link } from 'react-router-dom';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Divider from '@mui/material/Divider';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import AccountCircleRoundedIcon from '@mui/icons-material/AccountCircleRounded';
import LogoutButton from './logoutButton'

const ProfileButton = ({ forceLabel = false }) => {
    const { user, isAuthenticated } = useAuth0();
    const [anchorEl, setAnchorEl] = useState(null);
    const menuOpen = Boolean(anchorEl);
    const handleToggle = (event) => {
        setAnchorEl((current) => (current ? null : event.currentTarget));
    };

    return isAuthenticated ? (
        <>
            <ButtonBase
                onClick={handleToggle}
                sx={{
                    borderRadius: '999px',
                    px: 1.1,
                    py: 0.6,
                    width: forceLabel ? '100%' : 'auto',
                    border: '1px solid rgba(255, 250, 244, 0.18)',
                    color: 'inherit',
                    backdropFilter: 'blur(12px)',
                    backgroundColor: 'rgba(255, 250, 244, 0.08)',
                }}
            >
                <Stack alignItems="center" direction="row" justifyContent="space-between" spacing={1.2} sx={{ width: '100%' }}>
                    <Avatar
                        alt={user.name}
                        src={user.picture}
                        sx={{ width: 42, height: 42, border: '2px solid rgba(255, 250, 244, 0.75)' }}
                    />
                    <Box sx={{ display: forceLabel ? 'block' : { xs: 'none', md: 'block' }, flexGrow: 1, textAlign: 'left' }}>
                        <Typography sx={{ fontSize: '0.95rem', fontWeight: 700, lineHeight: 1.2 }}>
                            {user.nickname || user.name}
                        </Typography>
                        <Typography sx={{ fontSize: '0.76rem', opacity: 0.74 }}>
                            Personal workspace
                        </Typography>
                    </Box>
                    <KeyboardArrowDownRoundedIcon
                        sx={{
                            opacity: 0.85,
                            transform: menuOpen ? 'rotate(180deg)' : 'none',
                            transition: 'transform 0.2s ease',
                        }}
                    />
                </Stack>
            </ButtonBase>
            <Menu
                anchorEl={anchorEl}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                onClose={() => setAnchorEl(null)}
                open={menuOpen}
                slotProps={{
                    list: {
                        sx: {
                            py: 0.7,
                        },
                    },
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                PaperProps={{
                    sx: {
                        mt: 0.7,
                        minWidth: 250,
                        overflow: 'visible',
                        borderRadius: '24px',
                        border: '1px solid rgba(31, 64, 87, 0.1)',
                        boxShadow: '0 28px 70px rgba(25, 48, 66, 0.18)',
                        '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: -8,
                            right: 22,
                            width: 16,
                            height: 16,
                            background: 'rgba(255, 250, 244, 0.98)',
                            borderTop: '1px solid rgba(31, 64, 87, 0.1)',
                            borderLeft: '1px solid rgba(31, 64, 87, 0.1)',
                            transform: 'rotate(45deg)',
                            zIndex: 0,
                        },
                    },
                }}
            >
                <Box sx={{ px: 2, py: 1.8, position: 'relative', zIndex: 1 }}>
                    <Typography sx={{ fontWeight: 700 }}>{user.email || user.name}</Typography>
                    <Typography sx={{ color: 'text.secondary', fontSize: '0.86rem' }}>
                        Signed in with Auth0
                    </Typography>
                </Box>
                <Divider />
                <MenuItem component={Link} onClick={() => setAnchorEl(null)} sx={{ minHeight: 44 }} to="/profile">
                    <AccountCircleRoundedIcon fontSize="small" sx={{ mr: 1.2 }} />
                    Profile Details
                </MenuItem>
                <LogoutButton onClick={() => setAnchorEl(null)} />
            </Menu>
        </>
    ) : null;

};

export default ProfileButton;
