export const PRIORITY_OPTIONS = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
];

export const TODO_COLUMN_NAMES = ['todo', 'task', 'title', 'value', 'text', 'description', 'name'];
export const STATUS_COLUMN_NAMES = ['completed', 'done', 'status'];
export const PRIORITY_COLUMN_NAMES = ['priority', 'importance', 'level'];
export const DUE_DATE_COLUMN_NAMES = ['due date', 'due_date', 'duedate', 'due', 'deadline', 'date'];

export const normalizeKey = (value) => String(value || '').trim().toLowerCase();

export const getPriorityLabel = (value) =>
    PRIORITY_OPTIONS.find((option) => option.value === value)?.label || 'Medium';

export const getPriorityColor = (value) => {
    if (value === 'high') {
        return 'error';
    }
    if (value === 'low') {
        return 'info';
    }
    return 'warning';
};

export const parseStatusValue = (value) => {
    if (typeof value === 'boolean') {
        return { value, valid: true };
    }
    if (typeof value === 'number') {
        return { value: value === 1, valid: true };
    }

    const normalized = normalizeKey(value);
    if (['true', 'yes', 'done', 'completed', '1'].includes(normalized)) {
        return { value: true, valid: true };
    }

    if (['false', 'no', 'in focus', 'in-focus', 'active', 'pending', 'todo', '0', ''].includes(normalized)) {
        return { value: false, valid: true };
    }

    return { value: false, valid: false, message: 'Status should be done or in focus.' };
};

export const parseCompletedValue = (value) => parseStatusValue(value).value;

export const parsePriorityValue = (value) => {
    const normalized = normalizeKey(value);

    if (!normalized || normalized === 'normal') {
        return { value: 'medium', valid: true };
    }

    if (normalized === 'urgent') {
        return { value: 'high', valid: true };
    }

    if (['low', 'medium', 'high'].includes(normalized)) {
        return { value: normalized, valid: true };
    }

    return { value: 'medium', valid: false, message: 'Priority should be low, medium, or high.' };
};

const padDate = (value) => String(value).padStart(2, '0');

const isValidIsoDate = (value) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        return false;
    }

    const [year, month, day] = value.split('-').map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));
    return (
        date.getUTCFullYear() === year
        && date.getUTCMonth() === month - 1
        && date.getUTCDate() === day
    );
};

const excelSerialToIsoDate = (serial) => {
    const utcDays = Math.floor(serial - 25569);
    const utcValue = utcDays * 86400;
    const dateInfo = new Date(utcValue * 1000);

    if (Number.isNaN(dateInfo.getTime())) {
        return '';
    }

    return `${dateInfo.getUTCFullYear()}-${padDate(dateInfo.getUTCMonth() + 1)}-${padDate(dateInfo.getUTCDate())}`;
};

export const parseDueDateValue = (value) => {
    if (value === null || value === undefined || value === '') {
        return { value: '', valid: true };
    }

    if (value instanceof Date) {
        if (Number.isNaN(value.getTime())) {
            return { value: '', valid: false, message: 'Due date is not a valid calendar date.' };
        }

        return {
            value: `${value.getFullYear()}-${padDate(value.getMonth() + 1)}-${padDate(value.getDate())}`,
            valid: true,
        };
    }

    if (typeof value === 'number') {
        const isoDate = excelSerialToIsoDate(value);
        if (isoDate && isValidIsoDate(isoDate)) {
            return { value: isoDate, valid: true };
        }

        return { value: '', valid: false, message: 'Due date could not be read from Excel.' };
    }

    const trimmedValue = String(value).trim();
    if (!trimmedValue) {
        return { value: '', valid: true };
    }

    if (isValidIsoDate(trimmedValue)) {
        return { value: trimmedValue, valid: true };
    }

    const parsedDate = new Date(trimmedValue);
    if (Number.isNaN(parsedDate.getTime())) {
        return { value: '', valid: false, message: 'Due date should look like 2026-04-09.' };
    }

    const isoDate = `${parsedDate.getFullYear()}-${padDate(parsedDate.getMonth() + 1)}-${padDate(parsedDate.getDate())}`;
    if (!isValidIsoDate(isoDate)) {
        return { value: '', valid: false, message: 'Due date is not a valid calendar date.' };
    }

    return { value: isoDate, valid: true };
};

export const formatDueDate = (value) => {
    if (!value) {
        return 'No date';
    }

    const date = new Date(`${value}T00:00:00`);
    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return new Intl.DateTimeFormat(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    }).format(date);
};

export const getDueDateState = (value) => {
    if (!value) {
        return 'none';
    }

    const today = new Date();
    const todayIso = `${today.getFullYear()}-${padDate(today.getMonth() + 1)}-${padDate(today.getDate())}`;

    if (value === todayIso) {
        return 'today';
    }

    if (value < todayIso) {
        return 'overdue';
    }

    return 'upcoming';
};
