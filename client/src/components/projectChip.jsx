import Chip from '@mui/material/Chip';
import { DEFAULT_PROJECT, getProjectTone } from '../utils/todoFields';

function ProjectChip({ label, project, size = 'small', variant = 'outlined' }) {
    const resolvedProject = project || DEFAULT_PROJECT;
    const resolvedLabel = label || resolvedProject;
    const tone = getProjectTone(resolvedProject);

    return (
        <Chip
            label={resolvedLabel}
            size={size}
            sx={{
                background: tone.background,
                borderColor: tone.borderColor,
                color: tone.color,
                fontWeight: 700,
                height: size === 'small' ? 28 : 32,
            }}
            variant={variant}
        />
    );
}

export default ProjectChip;
