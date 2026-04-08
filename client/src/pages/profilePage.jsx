import { useAuth0 } from "@auth0/auth0-react";
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import AccountCircleRoundedIcon from '@mui/icons-material/AccountCircleRounded';

const ProfilePage = () => {
  const { user, isAuthenticated, isLoading } = useAuth0();

  const fields = user
    ? Object.entries(user).filter(([key]) => key !== "picture" && key !== "nickname")
    : [];

  const formatLabel = (value) =>
    value
      .replaceAll('_', ' ')
      .replace(/\b\w/g, (letter) => letter.toUpperCase());

  if (isLoading) {
    return (
      <Box className="page-shell">
        <Paper className="surface-panel fade-in-up" sx={{ p: 4, borderRadius: 6, textAlign: 'center' }}>
          <Typography variant="h4">Loading your profile...</Typography>
        </Paper>
      </Box>
    );
  }
  return (
    isAuthenticated && (
      <Box className="page-shell">
        <Paper className="surface-panel fade-in-up" sx={{ p: 2.4, borderRadius: '28px' }}>
          <Stack spacing={2}>
            <Avatar
              alt={user.name}
              src={user.picture}
              sx={{
                width: { xs: 72, md: 92 },
                height: { xs: 72, md: 92 },
                border: '4px solid rgba(255, 250, 244, 0.8)',
                boxShadow: '0 18px 40px rgba(25, 48, 66, 0.16)',
              }}
            />
            <Box sx={{ minWidth: 0 }}>
              <p className="eyebrow">Profile snapshot</p>
              <Typography className="page-title" sx={{ fontSize: { xs: '2rem', md: '3.2rem' } }} variant="h1">
                Hello {user.nickname || user.name}
              </Typography>
              <Typography className="page-subtitle" sx={{ mt: 1.1 }}>
                This page reflects the Auth0 profile data currently attached to your signed-in session.
              </Typography>
              <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mt: 2, maxWidth: '100%', minWidth: 0 }}>
                {user.email && (
                  <Chip
                    label={user.email}
                    variant="outlined"
                    sx={{
                      maxWidth: '100%',
                      width: 'fit-content',
                      alignSelf: 'flex-start',
                      height: 'auto',
                      '& .MuiChip-label': {
                        display: 'block',
                        whiteSpace: 'normal',
                        overflowWrap: 'anywhere',
                        py: 0.75,
                      },
                    }}
                  />
                )}
                {user.sub && (
                  <Chip
                    label={user.sub}
                    variant="outlined"
                    sx={{
                      maxWidth: '100%',
                      width: 'fit-content',
                      alignSelf: 'flex-start',
                      height: 'auto',
                      '& .MuiChip-label': {
                        display: 'block',
                        whiteSpace: 'normal',
                        overflowWrap: 'anywhere',
                        py: 0.75,
                      },
                    }}
                  />
                )}
              </Stack>
            </Box>
          </Stack>
        </Paper>

        <Grid container spacing={2.2}>
          {fields.map(([key, value], index) => (
            <Grid item key={key} md={6} xs={12}>
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
                      flexShrink: 0,
                    }}
                  >
                    <AccountCircleRoundedIcon color="secondary" />
                  </Box>
                  <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                    <Typography sx={{ fontWeight: 700, mb: 0.4 }} variant="h6">
                      {formatLabel(key)}
                    </Typography>
                    <Typography
                      sx={{
                        color: 'text.secondary',
                        wordBreak: 'break-word',
                        overflowWrap: 'anywhere',
                      }}
                    >
                      {typeof value === 'string' ? value : JSON.stringify(value)}
                    </Typography>
                  </Box>
                </Stack>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>
    )
  );
};

export default ProfilePage;
