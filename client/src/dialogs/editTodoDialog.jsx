import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';

function EditTodoDialog({ open, closeEditTodoDialog, handleEditDialogSubmit, params, setParams }) {
    return (
        <Dialog fullWidth maxWidth="sm" onClose={closeEditTodoDialog} open={open}>
            <form onSubmit={handleEditDialogSubmit}>
                <DialogTitle>Refine your task</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        fullWidth
                        label="Task description"
                        multiline
                        minRows={2}
                        onChange={(e) => {
                            const updatedParams = { ...params, todo: e.target.value };
                            setParams(updatedParams);
                        }}
                        sx={{ mt: 1 }}
                        value={params.todo || ""}
                    />
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2.5 }}>
                    <Button onClick={closeEditTodoDialog} variant="text">
                        Cancel
                    </Button>
                    <Button color="secondary" type="submit" variant="contained">
                        Save changes
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
}

export default EditTodoDialog;
