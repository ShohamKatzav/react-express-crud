import { useEffect, useMemo, useState } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';
import ProjectChip from '../components/projectChip';

function ManageProjectsDialog({
    createProject,
    deleteProject,
    open,
    onClose,
    projects,
    updateProject,
}) {
    const [newProjectName, setNewProjectName] = useState('');
    const [drafts, setDrafts] = useState({});

    useEffect(() => {
        if (open) {
            setDrafts(
                projects.reduce((accumulator, project) => {
                    accumulator[project._id] = project.name;
                    return accumulator;
                }, {})
            );
        }
    }, [open, projects]);

    const sortedProjects = useMemo(
        () => [...projects].sort((projectA, projectB) => Number(projectA.isDefault) - Number(projectB.isDefault) || projectA.name.localeCompare(projectB.name)),
        [projects]
    );

    const handleClose = () => {
        setNewProjectName('');
        onClose();
    };

    const handleCreate = async () => {
        const wasCreated = await createProject(newProjectName);
        if (wasCreated) {
            setNewProjectName('');
        }
    };

    const handleRename = async (projectId) => {
        await updateProject(projectId, drafts[projectId]);
    };

    return (
        <Dialog fullWidth maxWidth="md" onClose={handleClose} open={open}>
            <DialogTitle>Manage projects</DialogTitle>
            <DialogContent>
                <Stack spacing={2.2} sx={{ pt: 1 }}>
                    <Paper
                        sx={{
                            p: 1.6,
                            borderRadius: '20px',
                            border: '1px solid rgba(31, 64, 87, 0.1)',
                            background: 'rgba(255, 250, 244, 0.62)',
                        }}
                        variant="outlined"
                    >
                        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.2}>
                            <TextField
                                fullWidth
                                helperText="Create projects like Launch, Learning, Home, or Admin."
                                label="New project"
                                onChange={(event) => setNewProjectName(event.target.value)}
                                placeholder="Launch"
                                value={newProjectName}
                            />
                            <Button
                                color="secondary"
                                onClick={handleCreate}
                                startIcon={<AddRoundedIcon />}
                                sx={{ minWidth: { md: 180 } }}
                                variant="contained"
                            >
                                Add project
                            </Button>
                        </Stack>
                    </Paper>

                    <Stack spacing={1.2}>
                        {sortedProjects.map((project) => (
                            <Paper
                                key={project._id}
                                sx={{
                                    p: 1.5,
                                    borderRadius: '20px',
                                    border: '1px solid rgba(31, 64, 87, 0.1)',
                                    background: 'rgba(255, 255, 255, 0.76)',
                                }}
                                variant="outlined"
                            >
                                <Stack direction={{ xs: 'column', lg: 'row' }} spacing={1.2}>
                                    <Stack spacing={0.7} sx={{ minWidth: { lg: 180 } }}>
                                        <ProjectChip project={project.name} size="medium" />
                                        <Typography sx={{ color: 'text.secondary', fontSize: '0.9rem' }}>
                                            {project.tasksCount} task{project.tasksCount === 1 ? '' : 's'}
                                            {project.isDefault ? ' - fallback project' : ''}
                                        </Typography>
                                    </Stack>
                                    <TextField
                                        fullWidth
                                        disabled={project.isDefault}
                                        label={project.isDefault ? 'Reserved project' : 'Project name'}
                                        onChange={(event) => {
                                            setDrafts((current) => ({
                                                ...current,
                                                [project._id]: event.target.value,
                                            }));
                                        }}
                                        value={drafts[project._id] || ''}
                                    />
                                    <Stack direction="row" spacing={0.6}>
                                        <Tooltip title={project.isDefault ? 'The Personal project is reserved' : 'Save name'}>
                                            <span>
                                                <IconButton
                                                    color="primary"
                                                    disabled={project.isDefault || !drafts[project._id] || drafts[project._id].trim() === project.name}
                                                    onClick={() => handleRename(project._id)}
                                                >
                                                    <SaveRoundedIcon />
                                                </IconButton>
                                            </span>
                                        </Tooltip>
                                        <Tooltip title={project.isDefault ? 'The Personal project cannot be deleted' : 'Delete project'}>
                                            <span>
                                                <IconButton
                                                    color="error"
                                                    disabled={project.isDefault}
                                                    onClick={() => deleteProject(project._id, project.name)}
                                                >
                                                    <DeleteRoundedIcon />
                                                </IconButton>
                                            </span>
                                        </Tooltip>
                                    </Stack>
                                </Stack>
                            </Paper>
                        ))}
                    </Stack>
                </Stack>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2.5 }}>
                <Button onClick={handleClose} variant="text">
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default ManageProjectsDialog;
