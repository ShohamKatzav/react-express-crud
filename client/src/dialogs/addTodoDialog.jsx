import { useState } from "react";
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { PRIORITY_OPTIONS } from '../utils/todoFields';

function AddToDoDialog({ addTodo, notifyError, notifyWarning }) {

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newTodoValue, setNewTodoValue] = useState("");
  const [isCompleted, setIsCompleted] = useState(false);
  const [priority, setPriority] = useState("medium");
  const [dueDate, setDueDate] = useState("");

  const cancelAddTodoDialog = () => {
    notifyWarning("Add operation canceled");
    setIsAddDialogOpen(false);
    setNewTodoValue("");
    setIsCompleted(false);
    setPriority("medium");
    setDueDate("");
  };

  const handleAddDialogSubmit = async (e) => {
    e.preventDefault();
    if (newTodoValue.trim()) {
      const wasAdded = await addTodo({
        value: newTodoValue,
        completed: isCompleted,
        priority,
        dueDate,
      });
      if (wasAdded) {
        setNewTodoValue("");
        setIsCompleted(false);
        setPriority("medium");
        setDueDate("");
        setIsAddDialogOpen(false);
      }
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
                fullWidth
                label="Task description"
                multiline
                minRows={2}
                onChange={(event) => setNewTodoValue(event.target.value)}
                placeholder="Write the next thing you want to get done..."
                value={newTodoValue}
              />
              <TextField
                fullWidth
                label="Status"
                onChange={(event) => setIsCompleted(event.target.value === "done")}
                select
                value={isCompleted ? "done" : "in-focus"}
              >
                <MenuItem value="in-focus">In focus</MenuItem>
                <MenuItem value="done">Done</MenuItem>
              </TextField>
              <TextField
                fullWidth
                label="Priority"
                onChange={(event) => setPriority(event.target.value)}
                select
                value={priority}
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
                onChange={(event) => setDueDate(event.target.value)}
                type="date"
                value={dueDate}
                InputLabelProps={{ shrink: true }}
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
