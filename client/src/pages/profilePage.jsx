import { useAuth0 } from "@auth0/auth0-react";
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

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
        <Paper className="surface-panel fade-in-up" sx={{ p: { xs: 2.2, md: 3.5 }, borderRadius: 6 }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems={{ md: 'center' }}>
            <Avatar
              alt={user.name}
              src={user.picture}
              sx={{
                width: { xs: 92, md: 126 },
                height: { xs: 92, md: 126 },
                border: '4px solid rgba(255, 250, 244, 0.8)',
                boxShadow: '0 18px 40px rgba(25, 48, 66, 0.16)',
              }}
            />
            <Box sx={{ flex: 1 }}>
              <p className="eyebrow">Profile snapshot</p>
              <Typography className="page-title" sx={{ fontSize: { xs: '2rem', md: '3.2rem' } }} variant="h1">
                Hello {user.nickname || user.name}
              </Typography>
              <Typography className="page-subtitle" sx={{ mt: 1.1 }}>
                This page reflects the Auth0 profile data currently attached to your signed-in session.
              </Typography>
              <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mt: 2 }}>
                {user.email && <Chip label={user.email} variant="outlined" />}
                {user.sub && <Chip label={user.sub} variant="outlined" />}
              </Stack>
            </Box>
          </Stack>
        </Paper>

        <Grid container spacing={2.2}>
          {fields.map(([key, value], index) => (
            <Grid item key={key} md={6} xs={12}>
              <Paper
                className={`surface-panel fade-in-up stagger-${(index % 4) + 1}`}
                sx={{ p: 2.2, borderRadius: 4, height: '100%' }}
              >
                <Typography sx={{ color: 'text.secondary', fontSize: '0.85rem', mb: 0.7, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  {formatLabel(key)}
                </Typography>
                <Typography sx={{ fontWeight: 700, wordBreak: 'break-word' }}>
                  {typeof value === 'string' ? value : JSON.stringify(value)}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>
    )
  );
};

export default ProfilePage;
