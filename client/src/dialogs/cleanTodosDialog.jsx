import { useState } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Typography from '@mui/material/Typography';
import DeleteSweepRoundedIcon from '@mui/icons-material/DeleteSweepRounded';

function CleanTodosDialog({ cleanList, dataToShow, notifyWarning }) {

    const [isCleanListDialogOpen, setIsCleanListDialogOpen] = useState(false);

    const cancelCleanListDialog = () => {
        notifyWarning("Clean list operation canceled");
        setIsCleanListDialogOpen(false);
    };
    const handleCleanListDialogSubmit = (e) => {
        e.preventDefault();
        setIsCleanListDialogOpen(false);
        cleanList();
    }

    return (
        <>
            <Button onClick={() => setIsCleanListDialogOpen(true)}
                disabled={dataToShow.length < 1}
                color="error"
                variant="outlined"
                startIcon={<DeleteSweepRoundedIcon />}>
                Clear list
            </Button>
            <Dialog fullWidth maxWidth="xs" onClose={cancelCleanListDialog} open={isCleanListDialogOpen}>
                <form onSubmit={handleCleanListDialogSubmit}>
                    <DialogTitle>Clear your list</DialogTitle>
                    <DialogContent>
                        <Typography sx={{ color: 'text.secondary' }}>
                            This will remove all {dataToShow.length} tasks from the current workspace.
                        </Typography>
                    </DialogContent>
                    <DialogActions sx={{ px: 3, pb: 2.5 }}>
                        <Button onClick={cancelCleanListDialog} variant="text">
                            Cancel
                        </Button>
                        <Button color="error" type="submit" variant="contained">
                            Delete all tasks
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
        </>
    );
}

export default CleanTodosDialog;
