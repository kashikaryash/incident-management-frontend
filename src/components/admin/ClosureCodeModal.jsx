import React, { useState, useEffect } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Box,
    Typography,
    FormControlLabel,
    Checkbox,
    IconButton,
} from "@mui/material";
import { Save, Close, CheckCircleOutline, Block } from "@mui/icons-material";

/**
 * Modal for adding or editing Closure Codes (e.g., "Solved", "Duplicate").
 * @param {object} props
 * @param {object} props.initial - The closure code data for editing (or null for adding).
 * @param {function} props.onSave - Function to call on form submission.
 * @param {function} props.onClose - Function to close the modal.
 */
const ClosureCodeModal = ({ initial, onSave, onClose }) => {
    const [name, setName] = useState("");
    const [active, setActive] = useState(true);
    const [isDefault, setIsDefault] = useState(false);
    const [nameError, setNameError] = useState(false);

    useEffect(() => {
        if (initial) {
            setName(initial.name || "");
            // Ensure boolean values are used, default to true for active if undefined
            setActive(initial.active ?? true); 
            setIsDefault(initial.isDefault ?? false);
        } else {
            // Reset for Add mode
            setName("");
            setActive(true);
            setIsDefault(false);
        }
    }, [initial]);

    const handleSubmit = (e) => {
        e.preventDefault();
        const trimmedName = name.trim();
        
        if (!trimmedName) {
            setNameError(true);
            return;
        }
        
        // Pass back all properties, including the ID if it exists (for update)
        onSave({ 
            id: initial?.id,
            name: trimmedName, 
            active, 
            isDefault 
        });

        // Close modal after successful submission
        onClose();
    };

    return (
        <Dialog 
            open={true} 
            onClose={onClose} 
            component="form" 
            onSubmit={handleSubmit} 
            maxWidth="xs" 
            fullWidth
        >
            <DialogTitle>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6">
                        {initial ? "Edit Closure Code" : "Add New Closure Code"}
                    </Typography>
                    <IconButton onClick={onClose} size="small">
                        <Close />
                    </IconButton>
                </Box>
            </DialogTitle>

            <DialogContent dividers>
                {/* Closure Code Name Input */}
                <TextField
                    autoFocus
                    margin="dense"
                    label="Closure Code Name"
                    type="text"
                    fullWidth
                    variant="outlined"
                    value={name}
                    onChange={(e) => {
                        setName(e.target.value);
                        setNameError(false); // Clear error on change
                    }}
                    placeholder="E.g., Solved by Analyst, Not an Incident"
                    error={nameError}
                    helperText={nameError ? "Closure Code Name is required" : null}
                    required
                />

                {/* Active Checkbox */}
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={active}
                            onChange={(e) => setActive(e.target.checked)}
                            icon={<Block color="error" />}
                            checkedIcon={<CheckCircleOutline color="success" />}
                        />
                    }
                    label={<Typography variant="body1" sx={{ fontWeight: 500 }}>Active</Typography>}
                    sx={{ mt: 1, display: 'block' }}
                />

                {/* Default Checkbox */}
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={isDefault}
                            onChange={(e) => setIsDefault(e.target.checked)}
                        />
                    }
                    label={<Typography variant="body1" sx={{ fontWeight: 500 }}>Set as Default</Typography>}
                    sx={{ mt: 1, display: 'block' }}
                />
            </DialogContent>

            <DialogActions>
                <Button onClick={onClose} color="inherit">
                    Cancel
                </Button>
                <Button type="submit" variant="contained" color="primary" startIcon={<Save />}>
                    Save
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ClosureCodeModal;