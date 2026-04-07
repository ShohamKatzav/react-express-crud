import { useAuth0 } from "@auth0/auth0-react";
import MenuItem from '@mui/material/MenuItem';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';

const LogoutButton = ({ onClick }) => {
  const { logout, isAuthenticated } = useAuth0();

  return isAuthenticated ? (
    <MenuItem
      onClick={() => {
        onClick?.();
        logout({ logoutParams: { returnTo: window.location.origin } });
      }}
    >
      <LogoutRoundedIcon fontSize="small" sx={{ mr: 1.2 }} />
      Log Out
    </MenuItem>
  ) : null;
};

export default LogoutButton;
