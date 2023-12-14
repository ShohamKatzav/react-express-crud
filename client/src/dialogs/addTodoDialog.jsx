import { React, useState, useRef } from "react";
import Button from '@mui/material/Button';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import './dialog.css';

function AddToDoDialog({ addTodo, buttonSize, notifyError, notifyWarning }) {

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const newTodoInput = useRef("");
  const newTodoCheckbox = useRef(false);

  const cancelAddTodoDialog = () => {
    notifyWarning("Add operation canceled");
    setIsAddDialogOpen(false);
  };

  const handleAddDialogSubmit = (e) => {
    e.preventDefault();
    if (newTodoInput.current.value.trim()) {
      addTodo(newTodoInput.current.value, newTodoCheckbox.current.checked);
      newTodoCheckbox.current.checked = false;
      newTodoInput.current.value = "";
      setIsAddDialogOpen(false);
    } else {
      notifyError("Please enter a todo value");
    }
  };

  return (
    <>
      <Button onClick={() => setIsAddDialogOpen(true)}
        variant="outlined" size={buttonSize}
        startIcon={<AddCircleOutlineIcon />}>
        Add
      </Button>
      {isAddDialogOpen &&
        <div className="modal">
          <form onSubmit={handleAddDialogSubmit}>
            <p>Please enter a new To-do value</p>
            <input className="promptInput" type="text" ref={newTodoInput} />
            <p> Status:
              <input type="checkbox" ref={newTodoCheckbox} />
            </p>
            <div className="button-container">
              <button className="promptButton red" type="button" onClick={cancelAddTodoDialog}>Cancel</button>
              <button className="promptButton green" type="submit">Submit</button>
            </div>
          </form>
        </div>
      }
    </>
  );

}

export default AddToDoDialog;