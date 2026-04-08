import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import { PRIORITY_OPTIONS } from '../utils/todoFields';

function EditTodoDialog({ open, closeEditTodoDialog, handleEditDialogSubmit, params, setParams }) {
    return (
        <Dialog fullWidth maxWidth="sm" onClose={closeEditTodoDialog} open={open}>
            <form onSubmit={handleEditDialogSubmit}>
                <DialogTitle>Refine your task</DialogTitle>
                <DialogContent>
                    <Stack spacing={2.2} sx={{ mt: 1 }}>
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
                            value={params.todo || ""}
                        />
                        <TextField
                            fullWidth
                            label="Status"
                            onChange={(e) => {
                                const updatedParams = { ...params, completed: e.target.value === 'done' };
                                setParams(updatedParams);
                            }}
                            select
                            value={params.completed ? 'done' : 'in-focus'}
                        >
                            <MenuItem value="in-focus">In focus</MenuItem>
                            <MenuItem value="done">Done</MenuItem>
                        </TextField>
                        <TextField
                            fullWidth
                            label="Priority"
                            onChange={(e) => {
                                const updatedParams = { ...params, priority: e.target.value };
                                setParams(updatedParams);
                            }}
                            select
                            value={params.priority || 'medium'}
                        >
                            {PRIORITY_OPTIONS.map((option) => (
                                <MenuItem key={option.value} value={option.value}>
                                    {option.label}
                                </MenuItem>
                            ))}
                        </TextField>
                        <TextField
                            fullWidth
                            helperText="Optional"
                            label="Due date"
                            onChange={(e) => {
                                const updatedParams = { ...params, dueDate: e.target.value };
                                setParams(updatedParams);
                            }}
                            type="date"
                            value={params.dueDate || ""}
                            InputLabelProps={{ shrink: true }}
                        />
                    </Stack>
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
