import { useState } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

function FetchTodoDialog({ fetchTodos, notifyWarning }) {

    const [isFetchDialogOpen, setIsFetchDialogOpen] = useState(false);
    const [fetchAmount, setFetchAmount] = useState(10);

    const cancelFetchTodoDialog = () => {
        notifyWarning("Fetch operation canceled");
        setIsFetchDialogOpen(false);
    };
    const handleFetchDialogSubmit = (e) => {
        e.preventDefault();
        setIsFetchDialogOpen(false);
        fetchTodos(fetchAmount);
    }

    return (
        <>
            <Button onClick={() => setIsFetchDialogOpen(true)}
                variant="outlined"
                startIcon={<FileDownloadIcon />}>
                Import sample tasks
            </Button>
            <Dialog fullWidth maxWidth="xs" onClose={cancelFetchTodoDialog} open={isFetchDialogOpen}>
                <form onSubmit={handleFetchDialogSubmit}>
                    <DialogTitle>Import sample tasks</DialogTitle>
                    <DialogContent>
                        <Stack spacing={1.8} sx={{ pt: 1 }}>
                            <Typography sx={{ color: 'text.secondary' }}>
                                Pull in a quick batch of demo todos to populate the workspace.
                            </Typography>
                            <TextField
                                fullWidth
                                label="How many tasks?"
                                onChange={(event) => setFetchAmount(Number(event.target.value))}
                                select
                                value={fetchAmount}
                            >
                                {[1, 5, 10, 20, 30, 100].map((value) => (
                                    <MenuItem key={value} value={value}>
                                        {value}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Stack>
                    </DialogContent>
                    <DialogActions sx={{ px: 3, pb: 2.5 }}>
                        <Button onClick={cancelFetchTodoDialog} variant="text">
                            Cancel
                        </Button>
                        <Button type="submit" variant="contained">
                            Import
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
        </>
    );
}

export default FetchTodoDialog;
