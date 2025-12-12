import React from 'react';
import { 
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions, // Added for completeness, often used with buttons
    IconButton,
    Typography,
    Box,
} from '@mui/material';
import { Close } from '@mui/icons-material';

/**
 * Reusable modal wrapper component using Material UI Dialog.
 * @param {object} props
 * @param {boolean} props.isOpen - Controls the visibility of the modal.
 * @param {function} props.onClose - Function to close the modal (called when clicking close button or backdrop).
 * @param {string} [props.title] - The title displayed in the modal header.
 * @param {React.ReactNode} props.children - The content of the modal body.
 * @param {('xs' | 'sm' | 'md' | 'lg' | 'xl' | false)} [props.maxWidth='sm'] - Max width of the dialog.
 * @param {boolean} [props.fullWidth=true] - If true, the dialog stretches to the max width.
 * @param {boolean} [props.disableEscapeKeyDown=false] - If true, hitting Escape key will not close the modal.
 * @param {React.ReactNode} [props.actions] - Optional content for the DialogActions (footer buttons).
 */
const Modal = ({ 
    isOpen, 
    onClose, 
    title, 
    children, 
    actions,
    maxWidth = 'sm', // Defaulting to sm, similar to the original max-w-lg
    fullWidth = true,
    ...rest 
}) => {
    return (
        <Dialog
            open={isOpen}
            onClose={onClose}
            maxWidth={maxWidth}
            fullWidth={fullWidth}
            // Pass through any other props like disableEscapeKeyDown
            {...rest} 
        >
            <DialogTitle sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: title ? '1px solid #eee' : 'none' }}>
                {/* Title */}
                {title && (
                    <Typography variant="h6" component="h2" sx={{ fontWeight: 600 }}>
                        {title}
                    </Typography>
                )}
                
                {/* Close Button */}
                <IconButton
                    aria-label="close"
                    onClick={onClose}
                    sx={{
                        color: (theme) => theme.palette.grey[500],
                        ml: 'auto', // Push to the right if there is no title
                    }}
                >
                    <Close />
                </IconButton>
            </DialogTitle>

            <DialogContent dividers sx={{ p: 2 }}>
                {children}
            </DialogContent>
            
            {/* Optional Actions/Footer Section */}
            {actions && (
                <DialogActions sx={{ p: 2, justifyContent: 'flex-end', borderTop: '1px solid #eee' }}>
                    {actions}
                </DialogActions>
            )}
        </Dialog>
    );
};

export default Modal;