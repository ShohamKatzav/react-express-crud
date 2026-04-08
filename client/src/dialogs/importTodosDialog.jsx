import { useRef, useState } from 'react';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import UploadFileRoundedIcon from '@mui/icons-material/UploadFileRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded';
import FlagRoundedIcon from '@mui/icons-material/FlagRounded';
import EventRoundedIcon from '@mui/icons-material/EventRounded';
import {
    DUE_DATE_COLUMN_NAMES,
    TODO_COLUMN_NAMES,
    PRIORITY_COLUMN_NAMES,
    STATUS_COLUMN_NAMES,
    formatDueDate,
    getPriorityColor,
    getPriorityLabel,
    normalizeKey,
    parseDueDateValue,
    parsePriorityValue,
    parseStatusValue,
} from '../utils/todoFields';

const buildPreviewRows = (rows) =>
    rows
        .map((row, index) => {
            const entries = Object.entries(row || {});
            const hasAnyValue = entries.some(([, value]) => String(value ?? '').trim());

            if (!hasAnyValue) {
                return null;
            }

            const todoEntry = entries.find(([key]) => TODO_COLUMN_NAMES.includes(normalizeKey(key)))
                || entries.find(([, value]) => String(value || '').trim());
            const statusEntry = entries.find(([key]) => STATUS_COLUMN_NAMES.includes(normalizeKey(key)));
            const priorityEntry = entries.find(([key]) => PRIORITY_COLUMN_NAMES.includes(normalizeKey(key)));
            const dueDateEntry = entries.find(([key]) => DUE_DATE_COLUMN_NAMES.includes(normalizeKey(key)));

            const statusResult = parseStatusValue(statusEntry?.[1]);
            const priorityResult = parsePriorityValue(priorityEntry?.[1]);
            const dueDateResult = parseDueDateValue(dueDateEntry?.[1]);
            const taskValue = String(todoEntry?.[1] || '').trim();
            const errors = [];

            if (!taskValue) {
                errors.push('Task is missing.');
            }
            if (!statusResult.valid && statusEntry) {
                errors.push(statusResult.message);
            }
            if (!priorityResult.valid && priorityEntry) {
                errors.push(priorityResult.message);
            }
            if (!dueDateResult.valid && dueDateEntry) {
                errors.push(dueDateResult.message);
            }

            return {
                rowNumber: index + 2,
                value: taskValue,
                completed: statusResult.value,
                priority: priorityResult.value,
                dueDate: dueDateResult.value,
                errors,
            };
        })
        .filter(Boolean);

function ImportTodosDialog({ fetchTodos, importTodos, notifyError, notifyWarning }) {
    const [open, setOpen] = useState(false);
    const [fetchAmount, setFetchAmount] = useState(10);
    const [selectedFileName, setSelectedFileName] = useState('');
    const [previewRows, setPreviewRows] = useState([]);
    const [isParsingFile, setIsParsingFile] = useState(false);
    const [isImportingPreview, setIsImportingPreview] = useState(false);
    const fileInputRef = useRef(null);

    const resetImportState = () => {
        setSelectedFileName('');
        setPreviewRows([]);
        setIsParsingFile(false);
        setIsImportingPreview(false);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const closeDialog = (shouldWarn = true) => {
        if (shouldWarn) {
            notifyWarning("Import operation canceled");
        }
        setOpen(false);
        resetImportState();
    };

    const handleSampleImport = () => {
        setOpen(false);
        resetImportState();
        fetchTodos(fetchAmount);
    };

    const handleFileChange = async (event) => {
        const file = event.target.files?.[0];
        if (!file) {
            return;
        }

        setSelectedFileName(file.name);
        setIsParsingFile(true);

        try {
            const buffer = await file.arrayBuffer();
            const XLSX = await import('xlsx');
            const workbook = XLSX.read(buffer, { type: 'array', cellDates: false });
            const firstSheetName = workbook.SheetNames[0];
            const firstSheet = workbook.Sheets[firstSheetName];
            const rows = XLSX.utils.sheet_to_json(firstSheet, { defval: '', raw: true });
            const parsedPreviewRows = buildPreviewRows(rows);

            if (!parsedPreviewRows.length) {
                setPreviewRows([]);
                notifyError("No valid todo rows were found in the selected Excel file");
                return;
            }

            setPreviewRows(parsedPreviewRows);
        } catch (error) {
            setPreviewRows([]);
            notifyError("Could not read the selected Excel file");
        } finally {
            setIsParsingFile(false);
        }
    };

    const validRows = previewRows.filter((row) => row.value && row.errors.length === 0);
    const invalidRows = previewRows.filter((row) => row.errors.length > 0);

    const handlePreviewImport = async () => {
        if (!validRows.length) {
            notifyError("There are no valid rows ready to import");
            return;
        }

        setIsImportingPreview(true);
        const didImport = await importTodos(validRows.map(({ completed, dueDate, priority, value }) => ({
            completed,
            dueDate,
            priority,
            value,
        })));
        setIsImportingPreview(false);

        if (didImport) {
            setOpen(false);
            resetImportState();
        }
    };

    const previewToShow = previewRows.slice(0, 6);

    return (
        <>
            <Button
                onClick={() => setOpen(true)}
                startIcon={<UploadFileRoundedIcon />}
                variant="outlined"
            >
                Import Tasks
            </Button>
            <Dialog fullWidth maxWidth="md" onClose={() => closeDialog()} open={open}>
                <DialogTitle>Import tasks</DialogTitle>
                <DialogContent>
                    <Stack divider={<Divider flexItem />} spacing={2.4} sx={{ pt: 1 }}>
                        <Stack spacing={1.8}>
                            <Typography variant="h6">
                                Sample tasks
                            </Typography>
                            <Typography sx={{ color: 'text.secondary' }}>
                                Pull in a quick batch of demo todos to populate the workspace.
                            </Typography>
                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.2}>
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
                                <Button onClick={handleSampleImport} sx={{ minWidth: { sm: 190 } }} variant="outlined">
                                    Import sample tasks
                                </Button>
                            </Stack>
                        </Stack>

                        <Stack spacing={1.5}>
                            <Typography variant="h6">
                                Excel file
                            </Typography>
                            <Typography sx={{ color: 'text.secondary' }}>
                                Upload an `.xlsx` or `.xls` file. Preview rows before import and fix any issues first.
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
                                        Recommended headers: `task`, `status`, `priority`, `dueDate`
                                    </Typography>
                                    <Box
                                        sx={{
                                            display: 'grid',
                                            gridTemplateColumns: '1.8fr 1fr 1fr 1fr',
                                            borderRadius: '14px',
                                            overflow: 'hidden',
                                            border: '1px solid rgba(31, 64, 87, 0.08)',
                                            fontSize: '0.92rem',
                                        }}
                                    >
                                        {[
                                            ['task', 'status', 'priority', 'dueDate'],
                                            ['Buy groceries', 'in focus', 'medium', '2026-04-10'],
                                            ['Send project update', 'done', 'high', '2026-04-09'],
                                            ['Book dentist appointment', 'in focus', 'low', ''],
                                        ].flatMap((row, rowIndex) =>
                                            row.map((cell, cellIndex) => (
                                                <Box
                                                    key={`${rowIndex}-${cellIndex}-${cell}`}
                                                    sx={{
                                                        px: 1.2,
                                                        py: 0.9,
                                                        backgroundColor: rowIndex === 0 ? 'rgba(31, 64, 87, 0.08)' : 'rgba(255, 255, 255, 0.55)',
                                                        borderBottom: rowIndex < 3 ? '1px solid rgba(31, 64, 87, 0.08)' : 'none',
                                                        borderRight: cellIndex < 3 ? '1px solid rgba(31, 64, 87, 0.08)' : 'none',
                                                        fontFamily: '"Consolas", "Courier New", monospace',
                                                        fontWeight: rowIndex === 0 ? 700 : 400,
                                                        overflowWrap: 'anywhere',
                                                    }}
                                                >
                                                    {cell || ' '}
                                                </Box>
                                            ))
                                        )}
                                    </Box>
                                    <Typography sx={{ color: 'text.secondary', fontSize: '0.9rem' }}>
                                        Accepted task headers: `task`, `todo`, `title`, `value`, `text`, `description`, `name`
                                    </Typography>
                                    <Typography sx={{ color: 'text.secondary', fontSize: '0.9rem' }}>
                                        Accepted status values: `done`, `completed`, `true`, `yes`, `1`, `in focus`, `active`, `pending`, `false`, `no`, `0`
                                    </Typography>
                                    <Typography sx={{ color: 'text.secondary', fontSize: '0.9rem' }}>
                                        Accepted priority values: `low`, `medium`, `high`, `normal`, `urgent`
                                    </Typography>
                                    <Typography sx={{ color: 'text.secondary', fontSize: '0.9rem' }}>
                                        Due date format: `YYYY-MM-DD`
                                    </Typography>
                                </Stack>
                            </Paper>

                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.2}>
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
                                    <Typography sx={{ alignSelf: 'center', color: 'text.secondary', fontSize: '0.92rem' }}>
                                        Selected: {selectedFileName}
                                    </Typography>
                                )}
                            </Stack>

                            {isParsingFile && (
                                <Typography sx={{ color: 'text.secondary', fontSize: '0.92rem' }}>
                                    Reading Excel file...
                                </Typography>
                            )}

                            {!!previewRows.length && (
                                <Paper
                                    sx={{
                                        p: 1.6,
                                        borderRadius: '22px',
                                        border: '1px solid rgba(31, 64, 87, 0.1)',
                                        background: 'rgba(255, 255, 255, 0.62)',
                                    }}
                                    variant="outlined"
                                >
                                    <Stack spacing={1.4}>
                                        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={1.2}>
                                            <Box>
                                                <Typography sx={{ fontWeight: 700 }}>
                                                    Import preview
                                                </Typography>
                                                <Typography sx={{ color: 'text.secondary', fontSize: '0.92rem', mt: 0.4 }}>
                                                    Only valid rows will be imported.
                                                </Typography>
                                            </Box>
                                            <Stack direction="row" flexWrap="wrap" gap={0.8}>
                                                <Chip
                                                    color="success"
                                                    icon={<CheckCircleRoundedIcon />}
                                                    label={`${validRows.length} ready`}
                                                    size="small"
                                                    variant="outlined"
                                                />
                                                <Chip
                                                    color={invalidRows.length ? 'error' : 'default'}
                                                    icon={<ErrorOutlineRoundedIcon />}
                                                    label={`${invalidRows.length} need attention`}
                                                    size="small"
                                                    variant="outlined"
                                                />
                                            </Stack>
                                        </Stack>

                                        <Stack spacing={1}>
                                            {previewToShow.map((row) => (
                                                <Box
                                                    key={row.rowNumber}
                                                    sx={{
                                                        p: 1.2,
                                                        borderRadius: '16px',
                                                        border: row.errors.length
                                                            ? '1px solid rgba(211, 47, 47, 0.18)'
                                                            : '1px solid rgba(63, 138, 105, 0.18)',
                                                        background: row.errors.length
                                                            ? 'rgba(255, 244, 244, 0.78)'
                                                            : 'rgba(245, 251, 247, 0.86)',
                                                    }}
                                                >
                                                    <Stack spacing={1}>
                                                        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={0.8}>
                                                            <Typography sx={{ fontWeight: 700 }}>
                                                                Row {row.rowNumber}
                                                            </Typography>
                                                            <Chip
                                                                color={row.errors.length ? 'error' : 'success'}
                                                                label={row.errors.length ? 'Needs attention' : 'Ready to import'}
                                                                size="small"
                                                                variant="outlined"
                                                            />
                                                        </Stack>
                                                        <Typography sx={{ fontWeight: 600 }}>
                                                            {row.value || 'Missing task'}
                                                        </Typography>
                                                        <Stack direction="row" flexWrap="wrap" gap={0.8}>
                                                            <Chip
                                                                label={row.completed ? 'Done' : 'In focus'}
                                                                size="small"
                                                                variant={row.completed ? 'filled' : 'outlined'}
                                                            />
                                                            <Chip
                                                                color={getPriorityColor(row.priority)}
                                                                icon={<FlagRoundedIcon />}
                                                                label={getPriorityLabel(row.priority)}
                                                                size="small"
                                                                variant="outlined"
                                                            />
                                                            <Chip
                                                                icon={<EventRoundedIcon />}
                                                                label={formatDueDate(row.dueDate)}
                                                                size="small"
                                                                variant="outlined"
                                                            />
                                                        </Stack>
                                                        {!!row.errors.length && (
                                                            <Typography sx={{ color: 'error.main', fontSize: '0.92rem' }}>
                                                                {row.errors.join(' ')}
                                                            </Typography>
                                                        )}
                                                    </Stack>
                                                </Box>
                                            ))}
                                        </Stack>

                                        {previewRows.length > previewToShow.length && (
                                            <Typography sx={{ color: 'text.secondary', fontSize: '0.9rem' }}>
                                                Showing the first {previewToShow.length} rows of {previewRows.length}.
                                            </Typography>
                                        )}

                                        <Button
                                            color="secondary"
                                            disabled={!validRows.length || isImportingPreview}
                                            onClick={handlePreviewImport}
                                            variant="contained"
                                        >
                                            {isImportingPreview ? 'Importing...' : `Import ${validRows.length} valid row${validRows.length === 1 ? '' : 's'}`}
                                        </Button>
                                    </Stack>
                                </Paper>
                            )}
                        </Stack>
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2.5 }}>
                    <Button onClick={() => closeDialog()} variant="text">
                        Cancel
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}

export default ImportTodosDialog;
