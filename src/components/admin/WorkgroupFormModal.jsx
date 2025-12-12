import React, { useState, useEffect } from "react";
// Assuming fetchUsersForDropdown is implemented and returns [{ id: number, username: string }]
import { fetchUsersForDropdown } from "../../services/LoginService"; 
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Box,
    Typography,
    Grid,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Checkbox,
    FormControlLabel,
    IconButton,
    CircularProgress
} from "@mui/material";
import { Close, Save, GroupWork, VpnKey, Home, CheckCircle } from "@mui/icons-material";

/**
 * Modal for creating or editing a Workgroup (a group of analysts).
 * @param {object} props
 * @param {object} props.workgroup - The workgroup data for editing (or null for creating).
 * @param {function} props.onClose - Function to close the modal.
 * @param {function} props.onSave - Function to handle form submission (API call).
 */
const WorkgroupFormModal = ({ workgroup, onClose, onSave }) => {
    const [name, setName] = useState("");
    const [displayName, setDisplayName] = useState("");
    const [ownerId, setOwnerId] = useState("");
    const [description, setDescription] = useState("");
    const [master, setMaster] = useState(false);
    const [defaultWorkgroup, setDefaultWorkgroup] = useState(false);
    const [active, setActive] = useState(true);

    const [ownerOptions, setOwnerOptions] = useState([]);
    const [loadingOwners, setLoadingOwners] = useState(false);
    const [nameError, setNameError] = useState(false);

    // 1. Load Owner Options (Users)
    useEffect(() => {
        const loadOwners = async () => {
            setLoadingOwners(true);
            try {
                const { data } = await fetchUsersForDropdown();
                setOwnerOptions(data || []);
            } catch (error) {
                console.error("Error fetching owner options:", error);
            } finally {
                setLoadingOwners(false);
            }
        };
        loadOwners();
    }, []);

    // 2. Load Existing Workgroup Data
    useEffect(() => {
        if (workgroup) {
            setName(workgroup.name || "");
            setDisplayName(workgroup.displayName || "");
            setOwnerId(workgroup.owner ? String(workgroup.owner.id) : ""); // Convert ID to string for Select value
            setDescription(workgroup.description || "");
            setMaster(workgroup.master || false);
            setDefaultWorkgroup(workgroup.defaultWorkgroup || false);
            setActive(workgroup.active ?? true);
        } else {
            // Reset state for new creation
            setName("");
            setDisplayName("");
            setOwnerId("");
            setDescription("");
            setMaster(false);
            setDefaultWorkgroup(false);
            setActive(true);
        }
    }, [workgroup]);

    const handleSubmit = (e) => {
        e.preventDefault();
        const trimmedName = name.trim();
        if (!trimmedName) {
            setNameError(true);
            return;
        }

        onSave({
            id: workgroup?.id, // Include ID if editing
            name: trimmedName,
            displayName: displayName.trim(),
            ownerId: ownerId ? parseInt(ownerId) : null,
            description: description.trim(),
            master,
            defaultWorkgroup,
            active,
        });

        // onClose(); // Assuming the parent component closes the modal after successful save/update
    };

    return (
        <Dialog 
            open={true} 
            onClose={onClose} 
            component="form" 
            onSubmit={handleSubmit} 
            maxWidth="sm" 
            fullWidth
        >
            <DialogTitle>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        <GroupWork sx={{ mr: 1, verticalAlign: 'middle' }} />
                        {workgroup ? "Edit Workgroup" : "Create New Workgroup"}
                    </Typography>
                    <IconButton onClick={onClose} size="small">
                        <Close />
                    </IconButton>
                </Box>
            </DialogTitle>

            <DialogContent dividers>
                <Grid container spacing={3}>
                    {/* Name */}
                    <Grid item xs={12} sm={6}>
                        <TextField
                            label="Name"
                            fullWidth
                            required
                            variant="outlined"
                            value={name}
                            onChange={(e) => {
                                setName(e.target.value);
                                setNameError(false);
                            }}
                            error={nameError}
                            helperText={nameError ? "Name is required" : "Unique identifier for the system."}
                        />
                    </Grid>

                    {/* Display Name */}
                    <Grid item xs={12} sm={6}>
                        <TextField
                            label="Display Name"
                            fullWidth
                            variant="outlined"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            helperText="User-friendly name."
                        />
                    </Grid>

                    {/* Owner (Dropdown) */}
                    <Grid item xs={12}>
                        <FormControl fullWidth required variant="outlined">
                            <InputLabel id="owner-select-label">Owner</InputLabel>
                            <Select
                                labelId="owner-select-label"
                                value={ownerId}
                                onChange={e => setOwnerId(e.target.value)}
                                label="Owner"
                                endAdornment={loadingOwners && <CircularProgress size={20} sx={{ mr: 2 }} />}
                            >
                                <MenuItem value="">Select Owner</MenuItem>
                                {ownerOptions.map(u => (
                                    <MenuItem key={u.id} value={String(u.id)}>
                                        {u.username}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>

                    {/* Description */}
                    <Grid item xs={12}>
                        <TextField
                            label="Description"
                            multiline
                            rows={3}
                            fullWidth
                            variant="outlined"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </Grid>
                    
                    {/* Checkboxes */}
                    <Grid item xs={12}>
                        <Box display="flex" gap={4}>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={master}
                                        onChange={(e) => setMaster(e.target.checked)}
                                        icon={<VpnKey />}
                                        checkedIcon={<VpnKey color="primary" />}
                                    />
                                }
                                label={<Typography variant="body2" sx={{ fontWeight: 500 }}>Master Workgroup</Typography>}
                            />
                            
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={defaultWorkgroup}
                                        onChange={(e) => setDefaultWorkgroup(e.target.checked)}
                                        icon={<Home />}
                                        checkedIcon={<Home color="secondary" />}
                                    />
                                }
                                label={<Typography variant="body2" sx={{ fontWeight: 500 }}>Default</Typography>}
                            />
                            
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={active}
                                        onChange={(e) => setActive(e.target.checked)}
                                        icon={<CheckCircle color="disabled" />}
                                        checkedIcon={<CheckCircle color="success" />}
                                    />
                                }
                                label={<Typography variant="body2" sx={{ fontWeight: 500 }}>Active</Typography>}
                            />
                        </Box>
                    </Grid>

                </Grid>
            </DialogContent>

            <DialogActions>
                <Button onClick={onClose} color="inherit">
                    Cancel
                </Button>
                <Button type="submit" variant="contained" color="primary" startIcon={<Save />}>
                    {workgroup ? "Update Workgroup" : "Create Workgroup"}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default WorkgroupFormModal;