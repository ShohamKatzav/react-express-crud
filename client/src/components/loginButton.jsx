import { useAuth0 } from "@auth0/auth0-react";
import Button from '@mui/material/Button';
import LoginRoundedIcon from '@mui/icons-material/LoginRounded';

const LoginButton = ({
  label = "Log In",
  size = "medium",
  variant = "contained",
  fullWidth = false,
  sx = {},
}) => {
  const { loginWithRedirect, isAuthenticated } = useAuth0();

  return !isAuthenticated ? (
    <Button
      color="secondary"
      fullWidth={fullWidth}
      onClick={() => loginWithRedirect()}
      size={size}
      startIcon={<LoginRoundedIcon />}
      sx={sx}
      variant={variant}
    >
      {label}
    </Button>
  ) : null;
};

export default LoginButton;
