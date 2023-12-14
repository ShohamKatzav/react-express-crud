import { React, useState } from 'react';
import Button from '@mui/material/Button';
import DeleteIcon from '@mui/icons-material/Delete';
import './dialog.css';

function CleanTodosDialog({ cleanList, dataToShow, buttonSize, notifyWarning }) {

    const [isCleanListDialogOpen, setIsCleanListDialogOpen] = useState(false);

    const cancelCleanListDialog = () => {
        notifyWarning("Clean list operation canceled");
        setIsCleanListDialogOpen(false);
    };
    const handleCleanListDialogSubmit = (e) => {
        e.preventDefault();
        setIsCleanListDialogOpen(false);
        cleanList();
    }

    return (
        <>
            <Button onClick={() => setIsCleanListDialogOpen(true)}
                disabled={dataToShow.length < 1}
                variant="outlined" size={buttonSize}
                startIcon={<DeleteIcon />}>
                Clean list
            </Button>
            { isCleanListDialogOpen &&
                <div className="modal">
                    <form onSubmit={handleCleanListDialogSubmit}>
                        <p>Are you sure you want to delete all the todos?</p>
                        <div className="button-container">
                            <button className="promptButton red" type="button" onClick={cancelCleanListDialog}>Cancel</button>
                            <button className="promptButton green" type="submit">Submit</button>
                        </div>
                    </form>
                </div>
            }
        </>
    );
}

export default CleanTodosDialog;