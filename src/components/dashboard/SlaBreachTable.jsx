import React from "react";
import { 
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Typography,
    Box,
} from "@mui/material";
import AccessTimeFilledIcon from '@mui/icons-material/AccessTimeFilled';

/**
 * Component to display a table of incidents, typically those approaching or in SLA breach.
 * @param {object} props
 * @param {Array<object>} props.incidents - Array of incident objects with SLA data.
 */
const SlaBreachTable = ({ incidents }) => {
    
    // Helper to format remaining SLA time (Example: formats 'PT3H30M' or 'Negative')
    const formatSlaTime = (timeString) => {
        if (!timeString) return "-";
        if (timeString.startsWith('-')) {
            return (
                <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', color: 'error.main', fontWeight: 600 }}>
                    <AccessTimeFilledIcon fontSize="small" sx={{ mr: 0.5 }} />
                    BREACHED
                </Box>
            );
        }
        // Basic example formatter for positive time (e.g., "3h 30m remaining")
        // In a real app, you would use a library like moment or dayjs to parse ISO durations.
        if (timeString.startsWith('PT')) {
            const timePart = timeString.substring(2);
            return timePart.toLowerCase().replace(/(\d+)([hms])/, (match, num, unit) => `${num}${unit} `).trim();
        }
        return timeString;
    };

    return (
        <TableContainer component={Paper} elevation={3}>
            <Table size="small" aria-label="SLA breach incidents table">
                {/* Table Header */}
                <TableHead>
                    <TableRow sx={{ bgcolor: 'warning.light' }}>
                        <TableCell sx={{ fontWeight: 'bold' }}>ID</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Short Description</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Category</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Response SLA</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Resolution SLA</TableCell>
                    </TableRow>
                </TableHead>
                
                {/* Table Body */}
                <TableBody>
                    {incidents.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={5} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                                <Typography variant="subtitle2">No incidents approaching or in SLA breach.</Typography>
                            </TableCell>
                        </TableRow>
                    ) : (
                        incidents.map((incident, index) => (
                            <TableRow 
                                key={index} 
                                sx={{ 
                                    '&:hover': { bgcolor: 'action.hover' },
                                    // Highlight breached rows (example logic)
                                    ...(incident.responseSlaRemaining?.startsWith('-') || incident.resolutionSlaRemaining?.startsWith('-') 
                                        ? { bgcolor: 'error.lighter' } : {})
                                }}
                            >
                                <TableCell>
                                    <Typography variant="body2" color="primary">
                                        {incident.id}
                                    </Typography>
                                </TableCell>
                                <TableCell>{incident.shortDescription}</TableCell>
                                <TableCell>{incident.category}</TableCell>
                                <TableCell>
                                    {formatSlaTime(incident.responseSlaRemaining)}
                                </TableCell>
                                <TableCell>
                                    {formatSlaTime(incident.resolutionSlaRemaining)}
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default SlaBreachTable;