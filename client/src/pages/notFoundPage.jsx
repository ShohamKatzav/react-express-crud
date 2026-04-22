import React from 'react';
import { Link } from 'react-router-dom';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';

export default function NotFoundPage() {
    return (
        <Box className="page-shell">
            <Paper className="surface-panel fade-in-up" sx={{ p: 4, borderRadius: '36px', textAlign: 'center' }}>
                <Stack spacing={2} alignItems="center">
                    <Typography variant="h3">Page not found</Typography>
                    <Typography sx={{ color: 'text.secondary' }}>We couldn't find the page you're looking for.</Typography>
                    <Button component={Link} to="/" variant="contained">Go to home</Button>
                </Stack>
            </Paper>
        </Box>
    );
}
