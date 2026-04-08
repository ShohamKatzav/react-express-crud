import { useState } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import DeleteSweepRoundedIcon from '@mui/icons-material/DeleteSweepRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import RadioButtonUncheckedRoundedIcon from '@mui/icons-material/RadioButtonUncheckedRounded';
import TuneRoundedIcon from '@mui/icons-material/TuneRounded';

function SelectedTodosDialog({
    changeSelectedStatus,
    deleteSelected,
    notifyWarning,
    selectedCount,
}) {
    const [open, setOpen] = useState(false);

    const closeDialog = () => {
        notifyWarning("Selected actions canceled");
        setOpen(false);
    };

    const runAction = async (action) => {
        setOpen(false);
        await action();
    };

    return (
        <>
            <Button
                color="primary"
                disabled={selectedCount < 1}
                onClick={() => setOpen(true)}
                startIcon={<TuneRoundedIcon />}
                variant="outlined"
            >
                Selected actions
            </Button>
            <Dialog fullWidth maxWidth="xs" onClose={closeDialog} open={open}>
                <DialogTitle>Selected actions</DialogTitle>
                <DialogContent>
                    <Stack spacing={1.6} sx={{ pt: 1 }}>
                        <Typography sx={{ color: 'text.secondary' }}>
                            Choose what to do with the {selectedCount} selected task{selectedCount === 1 ? '' : 's'}.
                        </Typography>
                        <Button
                            color="success"
                            onClick={() => runAction(() => changeSelectedStatus(true))}
                            startIcon={<CheckCircleRoundedIcon />}
                            variant="outlined"
                        >
                            Mark selected done
                        </Button>
                        <Button
                            color="warning"
                            onClick={() => runAction(() => changeSelectedStatus(false))}
                            startIcon={<RadioButtonUncheckedRoundedIcon />}
                            variant="outlined"
                        >
                            Mark selected active
                        </Button>
                        <Button
                            color="error"
                            onClick={() => runAction(deleteSelected)}
                            startIcon={<DeleteSweepRoundedIcon />}
                            variant="outlined"
                        >
                            Delete selected
                        </Button>
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2.5 }}>
                    <Button onClick={closeDialog} variant="text">
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}

export default SelectedTodosDialog;
