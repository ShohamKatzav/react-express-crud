import { React } from 'react';
import './dialog.css';

function EditTodoDialog({ closeEditTodoDialog, handleEditDialogSubmit, params, setParams }) {
    return (
        <div className="modal">
            <form onSubmit={handleEditDialogSubmit}>
                <p>Please enter a new To-do value</p>
                <input className="promptInput"
                    type="text"
                    defaultValue={params.todo}
                    onChange={(e) => {
                        const updatedParams = { ...params, todo: e.target.value };
                        setParams(updatedParams);
                    }}
                />
                <div className="button-container">
                    <button className="promptButton" type="button" onClick={closeEditTodoDialog}>Cancel</button>
                    <button className="promptButton" type="submit">Submit</button>
                </div>
            </form>
        </div>
    );
}

export default EditTodoDialog;