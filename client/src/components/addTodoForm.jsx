import { React, useRef } from "react";
import { toast } from 'react-toastify';

function AddToDoForm({ addTodo }) {

  const newTodoInput = useRef("");
  const newTodoCheckbox = useRef(false);


  const notifyError = (text) => {
    toast.dismiss();
    toast.error(text);
  }

  const handleAddTodo = (e) => {
    e.preventDefault();
    if (newTodoInput.current.value.trim()) {
      addTodo(newTodoInput.current.value, newTodoCheckbox.current.checked);
      newTodoCheckbox.current.checked = false;
      newTodoInput.current.value = "";
    } else {
      notifyError("Please enter a todo value");
    }
  };

  return (
    <>
      <div className="small-margin-top form-border">
        <form onSubmit={handleAddTodo}>
          <h3>Add a new task</h3>
          <div className="small-margin-top">
            <span className="new-todo-parameter">
              <label> Task: </label>
              <input type="text" ref={newTodoInput} />
            </span>
            <span className="new-todo-parameter">
              <label> Status: </label>
              <input type="checkbox" ref={newTodoCheckbox} />
            </span>
          </div>
          <div className="small-margin-top">
            <button type="submit" className="small-margin-top">Add Todo</button>
          </div>
        </form>
      </div>
    </>
  );

}

export default AddToDoForm;