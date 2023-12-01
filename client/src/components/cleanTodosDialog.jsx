import { React } from 'react';
import './dialog.css';

function CleanTodosDialog({ closeCleanListDialog, handleCleanListDialogSubmit }) {
    return (
        <div className="modal">
            <form onSubmit={handleCleanListDialogSubmit}>
                <p>Are you sure you want to delete all the todos?</p>
                <div className="button-container">
                    <button className="promptButton" type="button" onClick={closeCleanListDialog}>Cancel</button>
                    <button className="promptButton" type="submit">Submit</button>
                </div>
            </form>
        </div>
    );
}

export default CleanTodosDialog;