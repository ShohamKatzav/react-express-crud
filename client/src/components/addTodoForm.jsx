import { React, useRef } from "react";
import { toast } from 'react-toastify';

function AddToDoForm({ addTodo }) {

  const newTodoInput = useRef("");
  const newTodoCheckbox = useRef(false);


  const notifyWarning = (text) => {
    toast.dismiss();
    toast.warning(text);
  }

  const handleAddTodo = () => {
    if (newTodoInput.current.value.trim()) {
      addTodo(newTodoInput.current.value, newTodoCheckbox.current.checked);
      newTodoCheckbox.current.checked = false;
      newTodoInput.current.value = "";
    } else {
      notifyWarning("Please enter a todo value");
    }
  };

  return (
    <>
      <div className="small-margin-top">
        <h3>Add a new task</h3>
        <input type="text" ref={newTodoInput} />
        <input type="checkbox" ref={newTodoCheckbox} />
        <label>Completed?</label>
        <div className="small-margin-top">
          <button onClick={handleAddTodo}>Add Todo</button>
        </div>
      </div>
    </>
  );

}

export default AddToDoForm;