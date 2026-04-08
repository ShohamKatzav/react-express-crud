import Button from '@mui/material/Button';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';

const buildExportRows = (todos) =>
    todos.map((todo) => ({
        task: todo.todo,
        status: todo.completed ? 'done' : 'in focus',
    }));

const buildFileName = () => {
    const today = new Date().toISOString().slice(0, 10);
    return `todo-flow-export-${today}.xlsx`;
};

function ExportTodosDialog({ notifyError, notifySuccess, todos }) {
    const handleExport = async () => {
        if (!todos.length) {
            notifyError("There are no tasks to export");
            return;
        }

        try {
            const XLSX = await import('xlsx');
            const workbook = XLSX.utils.book_new();
            const worksheet = XLSX.utils.json_to_sheet(buildExportRows(todos));

            worksheet['!cols'] = [
                { wch: 42 },
                { wch: 14 },
            ];

            XLSX.utils.book_append_sheet(workbook, worksheet, 'Todos');
            XLSX.writeFile(workbook, buildFileName());
            notifySuccess(`${todos.length} tasks exported successfully`);
        } catch (error) {
            notifyError("Could not export tasks");
        }
    };

    return (
        <Button
            disabled={!todos.length}
            onClick={handleExport}
            startIcon={<DownloadRoundedIcon />}
            variant="outlined"
        >
            Export Excel
        </Button>
    );
}

export default ExportTodosDialog;
