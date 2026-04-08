import { useRef, useState } from 'react';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import UploadFileRoundedIcon from '@mui/icons-material/UploadFileRounded';

const TODO_COLUMN_NAMES = ['todo', 'task', 'title', 'value', 'text', 'description', 'name'];
const STATUS_COLUMN_NAMES = ['completed', 'done', 'status'];

const normalizeKey = (value) => String(value || '').trim().toLowerCase();

const parseCompletedValue = (value) => {
    if (typeof value === 'boolean') {
        return value;
    }
    if (typeof value === 'number') {
        return value === 1;
    }

    const normalized = normalizeKey(value);
    if (['true', 'yes', 'done', 'completed', '1'].includes(normalized)) {
        return true;
    }

    if (['false', 'no', 'in focus', 'in-focus', 'active', 'pending', 'todo', '0', ''].includes(normalized)) {
        return false;
    }

    return false;
};

const mapRowsToTodos = (rows) =>
    rows
        .map((row) => {
            const entries = Object.entries(row || {});
            const todoEntry = entries.find(([key]) => TODO_COLUMN_NAMES.includes(normalizeKey(key)))
                || entries.find(([, value]) => String(value || '').trim());
            const statusEntry = entries.find(([key]) => STATUS_COLUMN_NAMES.includes(normalizeKey(key)));

            return {
                value: String(todoEntry?.[1] || '').trim(),
                completed: parseCompletedValue(statusEntry?.[1]),
            };
        })
        .filter((item) => item.value);

function ImportTodosDialog({ fetchTodos, importTodos, notifyError, notifyWarning }) {
    const [open, setOpen] = useState(false);
    const [fetchAmount, setFetchAmount] = useState(10);
    const [selectedFileName, setSelectedFileName] = useState('');
    const fileInputRef = useRef(null);

    const closeDialog = (shouldWarn = true) => {
        if (shouldWarn) {
            notifyWarning("Import operation canceled");
        }
        setOpen(false);
        setSelectedFileName('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSampleSubmit = (e) => {
        e.preventDefault();
        setOpen(false);
        fetchTodos(fetchAmount);
    };

    const handleFileChange = async (event) => {
        const file = event.target.files?.[0];
        if (!file) {
            return;
        }

        setSelectedFileName(file.name);

        try {
            const buffer = await file.arrayBuffer();
            const XLSX = await import('xlsx');
            const workbook = XLSX.read(buffer, { type: 'array' });
            const firstSheetName = workbook.SheetNames[0];
            const firstSheet = workbook.Sheets[firstSheetName];
            const rows = XLSX.utils.sheet_to_json(firstSheet, { defval: '' });
            const todos = mapRowsToTodos(rows);

            if (!todos.length) {
                notifyError("No valid todo rows were found in the selected Excel file");
                return;
            }

            setOpen(false);
            await importTodos(todos);
            setSelectedFileName('');
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        } catch (error) {
            notifyError("Could not read the selected Excel file");
        }
    };

    return (
        <>
            <Button
                onClick={() => setOpen(true)}
                startIcon={<FileDownloadIcon />}
                variant="outlined"
            >
                Import tasks
            </Button>
            <Dialog fullWidth maxWidth="sm" onClose={() => closeDialog()} open={open}>
                <form onSubmit={handleSampleSubmit}>
                    <DialogTitle>Import tasks</DialogTitle>
                    <DialogContent>
                        <Stack divider={<Divider flexItem />} spacing={2.2} sx={{ pt: 1 }}>
                            <Stack spacing={1.8}>
                                <Typography variant="h6">
                                    Sample tasks
                                </Typography>
                                <Typography sx={{ color: 'text.secondary' }}>
                                    Pull in a quick batch of demo todos to populate the workspace.
                                </Typography>
                                <TextField
                                    fullWidth
                                    label="How many tasks?"
                                    onChange={(event) => setFetchAmount(Number(event.target.value))}
                                    select
                                    value={fetchAmount}
                                >
                                    {[1, 5, 10, 20, 30, 100].map((value) => (
                                        <MenuItem key={value} value={value}>
                                            {value}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </Stack>

                            <Stack spacing={1.4}>
                                <Typography variant="h6">
                                    Excel file
                                </Typography>
                                <Typography sx={{ color: 'text.secondary' }}>
                                    Upload an `.xlsx` or `.xls` file. Use one task column and one optional status column.
                                </Typography>
                                <Paper
                                    sx={{
                                        p: 1.6,
                                        borderRadius: '20px',
                                        border: '1px solid rgba(31, 64, 87, 0.1)',
                                        background: 'rgba(255, 250, 244, 0.7)',
                                    }}
                                    variant="outlined"
                                >
                                    <Stack spacing={1}>
                                        <Typography sx={{ fontWeight: 700 }}>
                                            Excel structure
                                        </Typography>
                                        <Typography sx={{ color: 'text.secondary', fontSize: '0.92rem' }}>
                                            Recommended headers: `task` and `status`
                                        </Typography>
                                        <Box
                                            sx={{
                                                display: 'grid',
                                                gridTemplateColumns: 'minmax(0, 1.5fr) minmax(0, 1fr)',
                                                borderRadius: '14px',
                                                overflow: 'hidden',
                                                border: '1px solid rgba(31, 64, 87, 0.08)',
                                                fontSize: '0.92rem',
                                            }}
                                        >
                                            {[
                                                ['task', 'status'],
                                                ['Buy groceries', 'in focus'],
                                                ['Send project update', 'done'],
                                                ['Book dentist appointment', 'in focus'],
                                            ].map((row, index) => (
                                                row.map((cell, cellIndex) => (
                                                    <Box
                                                        key={`${index}-${cellIndex}-${cell}`}
                                                        sx={{
                                                            px: 1.2,
                                                            py: 0.9,
                                                            backgroundColor: index === 0 ? 'rgba(31, 64, 87, 0.08)' : 'rgba(255, 255, 255, 0.55)',
                                                            borderBottom: index < 3 ? '1px solid rgba(31, 64, 87, 0.08)' : 'none',
                                                            borderRight: cellIndex === 0 ? '1px solid rgba(31, 64, 87, 0.08)' : 'none',
                                                            fontFamily: '"Consolas", "Courier New", monospace',
                                                            fontWeight: index === 0 ? 700 : 400,
                                                            overflowWrap: 'anywhere',
                                                        }}
                                                    >
                                                        {cell}
                                                    </Box>
                                                ))
                                            ))}
                                        </Box>
                                        <Typography sx={{ color: 'text.secondary', fontSize: '0.9rem' }}>
                                            Accepted task headers: `task`, `todo`, `title`, `value`, `text`, `description`, `name`
                                        </Typography>
                                        <Typography sx={{ color: 'text.secondary', fontSize: '0.9rem' }}>
                                            Accepted status values: `done`, `completed`, `true`, `yes`, `1`, `in focus`, `active`, `pending`, `false`, `no`, `0`
                                        </Typography>
                                    </Stack>
                                </Paper>
                                <Button
                                    component="label"
                                    startIcon={<UploadFileRoundedIcon />}
                                    variant="contained"
                                >
                                    Choose Excel file
                                    <input
                                        accept=".xlsx,.xls"
                                        hidden
                                        onChange={handleFileChange}
                                        ref={fileInputRef}
                                        type="file"
                                    />
                                </Button>
                                {selectedFileName && (
                                    <Typography sx={{ color: 'text.secondary', fontSize: '0.92rem' }}>
                                        Selected: {selectedFileName}
                                    </Typography>
                                )}
                            </Stack>
                        </Stack>
                    </DialogContent>
                    <DialogActions sx={{ px: 3, pb: 2.5 }}>
                        <Button onClick={() => closeDialog()} variant="text">
                            Cancel
                        </Button>
                        <Button type="submit" variant="outlined">
                            Import sample tasks
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
        </>
    );
}

export default ImportTodosDialog;
