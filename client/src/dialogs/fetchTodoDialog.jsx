import { React, useState } from 'react';
import Button from '@mui/material/Button';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import './dialog.css';

function FetchTodoDialog({ fetchTodos, fetchAmountRef, buttonSize, notifyWarning }) {

    const [isFetchDialogOpen, setIsFetchDialogOpen] = useState(false);

    const cancelFetchTodoDialog = () => {
        notifyWarning("Fetch operation canceled");
        setIsFetchDialogOpen(false);
    };
    const handleFetchDialogSubmit = (e) =>{
        e.preventDefault();
        setIsFetchDialogOpen(false);
        fetchTodos();
    }

    return (
        <>
            <Button onClick={() => setIsFetchDialogOpen(true)}
                variant="outlined" size={buttonSize}
                startIcon={<FileDownloadIcon />}>
                Fetch
            </Button>
            {isFetchDialogOpen &&
                <div className="modal">
                    <form onSubmit={handleFetchDialogSubmit}>
                        <p>Choose an amount to fetch:</p>
                        <div>
                            <select ref={fetchAmountRef} className='promptSelect' name="fetch" id="fetch" defaultValue={30}>
                                {[1, 5, 10, 20, 30, 100].map(x => <option key={x} value={x}>{x}</option>)}
                            </select>
                        </div>
                        <div className="button-container">
                            <button className="promptButton red" type="button" onClick={cancelFetchTodoDialog}>Cancel</button>
                            <button className="promptButton green" type="submit">Submit</button>
                        </div>
                    </form>
                </div>
            }
        </>
    );
}

export default FetchTodoDialog;