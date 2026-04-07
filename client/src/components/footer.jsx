import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import ChecklistRoundedIcon from '@mui/icons-material/ChecklistRounded';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <Container className="footer-container" disableGutters maxWidth={false}>
        <Box className="footer-panel fade-in-up stagger-4">
          <Stack
            alignItems={{ xs: 'flex-start', md: 'center' }}
            direction={{ xs: 'column', md: 'row' }}
            justifyContent="space-between"
            spacing={2}
          >
            <Stack alignItems="center" direction="row" spacing={1.5}>
              <Box className="footer-brand-mark">
                <ChecklistRoundedIcon sx={{ color: 'secondary.main', fontSize: '1.45rem' }} />
              </Box>
              <Box>
                <Typography className="footer-title">
                  Todo Flow
                </Typography>
                <Typography className="footer-copy">
                  A polished React, Express, MongoDB and Auth0 workspace for personal task flow.
                </Typography>
              </Box>
            </Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
              <Chip label="React + Vite" variant="outlined" />
              <Chip label="Express API" variant="outlined" />
              <Chip label={`© ${new Date().getFullYear()}`} variant="outlined" />
            </Stack>
          </Stack>
        </Box>
      </Container>
    </footer>
  );
};

export default Footer;
