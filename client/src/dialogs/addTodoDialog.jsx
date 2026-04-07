import { useState } from "react";
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControlLabel from '@mui/material/FormControlLabel';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

function AddToDoDialog({ addTodo, notifyError, notifyWarning }) {

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newTodoValue, setNewTodoValue] = useState("");
  const [isCompleted, setIsCompleted] = useState(false);

  const cancelAddTodoDialog = () => {
    notifyWarning("Add operation canceled");
    setIsAddDialogOpen(false);
    setNewTodoValue("");
    setIsCompleted(false);
  };

  const handleAddDialogSubmit = (e) => {
    e.preventDefault();
    if (newTodoValue.trim()) {
      addTodo(newTodoValue, isCompleted);
      setNewTodoValue("");
      setIsCompleted(false);
      setIsAddDialogOpen(false);
    } else {
      notifyError("Please enter a todo value");
    }
  };

  return (
    <>
      <Button onClick={() => setIsAddDialogOpen(true)}
        color="secondary"
        variant="contained"
        startIcon={<AddCircleOutlineIcon />}>
        New task
      </Button>
      <Dialog
        fullWidth
        maxWidth="sm"
        onClose={cancelAddTodoDialog}
        open={isAddDialogOpen}
      >
        <form onSubmit={handleAddDialogSubmit}>
          <DialogTitle>Create a new task</DialogTitle>
          <DialogContent>
            <Stack spacing={2.2} sx={{ pt: 1 }}>
              <TextField
                autoFocus
                label="Task description"
                multiline
                minRows={2}
                onChange={(event) => setNewTodoValue(event.target.value)}
                placeholder="Write the next thing you want to get done..."
                value={newTodoValue}
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={isCompleted}
                    color="success"
                    onChange={(event) => setIsCompleted(event.target.checked)}
                  />
                }
                label="Mark this task as completed right away"
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2.5 }}>
            <Button onClick={cancelAddTodoDialog} variant="text">
              Cancel
            </Button>
            <Button color="secondary" type="submit" variant="contained">
              Add task
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </>
  );

}

export default AddToDoDialog;
