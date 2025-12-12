import React from 'react';
import { 
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    Typography,
    Alert,
    IconButton,
} from '@mui/material';
import { Close, CheckCircle, FiberManualRecord } from '@mui/icons-material'; // Using MUI icons

/**
 * Modal to confirm successful incident logging and display key details.
 * * @param {object} props
 * @param {boolean} props.isOpen - Controls the visibility of the modal.
 * @param {function} props.onClose - Function to close the modal (and usually reset the form).
 * @param {object} props.incidentDetails - Details like { incidentId, priority, serviceWindow }.
 */
const IncidentSuccessModal = ({ isOpen, onClose, incidentDetails }) => {
    if (!isOpen || !incidentDetails) return null;

    const { incidentId, priority, serviceWindow } = incidentDetails;

    // Helper function for the detail rows
    const DetailRow = ({ label, value, color = 'text.primary' }) => (
        <Box display="flex" justifyContent="space-between" py={0.5} borderBottom={1} borderColor="divider">
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                {label}
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 700, color }}>
                {value}
            </Typography>
        </Box>
    );

    // Determine priority color (MUI color palette)
    const getPriorityColor = (p) => {
        switch (p?.toUpperCase()) {
            case 'CRITICAL': return 'error.main';
            case 'HIGH': return 'warning.main';
            case 'MEDIUM': return 'info.main';
            default: return 'success.main';
        }
    };

    return (
        <Dialog 
            open={isOpen} 
            onClose={onClose} 
            maxWidth="xs" 
            fullWidth
            sx={{ '& .MuiDialog-paper': { mt: '10vh' } }} // Lift the modal up slightly
        >
            {/* Modal Header/Banner - Using MUI Alert for the success style */}
            <Alert 
                severity="success" 
                variant="filled" 
                icon={<CheckCircle fontSize="inherit" />}
                action={
                    <IconButton 
                        aria-label="close" 
                        color="inherit" 
                        size="small" 
                        onClick={onClose}
                    >
                        <Close fontSize="inherit" />
                    </IconButton>
                }
                sx={{ 
                    bgcolor: '#D9E5F3', // Light Blue Background
                    color: '#005a96', // Dark Blue Text
                    fontWeight: 600,
                    borderRadius: '8px 8px 0 0',
                    '.MuiAlert-icon': { 
                        color: '#005a96', // Dark Blue Icon
                    },
                    '.MuiAlert-message': {
                        fontSize: '1rem',
                        fontWeight: 600,
                    }
                }}
            >
                Your incident is logged successfully.
            </Alert>
            
            <DialogContent dividers sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <DetailRow 
                        label="Incident ID" 
                        value={incidentId} 
                        color="primary.main"
                    />
                    <DetailRow 
                        label="Priority" 
                        value={priority}
                        color={getPriorityColor(priority)}
                    />
                    <DetailRow 
                        label="Service Window" 
                        value={serviceWindow} 
                    />
                </Box>
            </DialogContent>

            <DialogActions sx={{ p: 2, justifyContent: 'center', borderTop: 1, borderColor: 'divider' }}>
                <Button 
                    variant="outlined" 
                    onClick={() => { /* Navigate to dashboard */ onClose(); }}
                >
                    View Dashboard
                </Button>
                <Button 
                    variant="outlined" 
                    onClick={() => { /* Navigate to my incidents */ onClose(); }}
                >
                    My Incidents
                </Button>
                <Button 
                    variant="contained" 
                    onClick={onClose} 
                    color="primary"
                >
                    New Incident
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default IncidentSuccessModal;