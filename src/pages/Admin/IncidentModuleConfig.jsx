import React, { useEffect, useState } from "react";
import {
  Container, Paper, Typography, Button, Box, TextField,
  FormControl, InputLabel, Select, MenuItem, Chip,
  Grid, Switch, FormControlLabel, CircularProgress, Alert,
} from "@mui/material";
import { Save as SaveIcon, Add as AddIcon, Settings as SettingsIcon, PriorityHigh as PriorityIcon, AccessTime as TimeIcon } from "@mui/icons-material";

// Placeholder for API URL
const API_BASE = "https://incidentmanagementsystem-backend.onrender.com/api/config";

const initialSlaThresholds = {
    P1: { response: "", resolution: "" },
    P2: { response: "", resolution: "" },
    P3: { response: "", resolution: "" },
    P4: { response: "", resolution: "" },
    P5: { response: "", resolution: "" }
};

const IncidentModuleConfig = () => {
    const [config, setConfig] = useState({
        statusOptions: [],
        priorityLevels: [],
        impactLevels: [],
        urgencyLevels: [],
        categories: [],
        contactTypes: [],
        assignmentGroups: [],
        customFields: [],
        slaThresholds: initialSlaThresholds,
        approvalWorkflowEnabled: false,
        auditTrailEnabled: false
    });
    const [loading, setLoading] = useState(true);
    const [fieldInput, setFieldInput] = useState("");
    const [customField, setCustomField] = useState({ name: "", type: "Text" });

    // ------------------------------
    // Data Fetching Logic
    // ------------------------------
    useEffect(() => {
        const fetchConfig = async () => {
            setLoading(true);
            try {
                const res = await fetch(`${API_BASE}/getConfig`, {
                    credentials: "include",
                });
                if (!res.ok) throw new Error("Failed to load config");
                const json = await res.json();

                if (json) {
                    setConfig({
                        approvalWorkflowEnabled: json.approvalRequired || false,
                        auditTrailEnabled: json.auditTrailEnabled || false,
                        priorityLevels: json.priorityLevels ? json.priorityLevels.split(",").filter(v => v) : [],
                        impactLevels: json.impactLevels ? json.impactLevels.split(",").filter(v => v) : [],
                        urgencyLevels: json.urgencyLevels ? json.urgencyLevels.split(",").filter(v => v) : [],
                        statusOptions: json.statusOptions ? json.statusOptions.split(",").filter(v => v) : [],
                        categories: json.categories ? json.categories.split(",").filter(v => v) : [],
                        contactTypes: json.contactTypes ? json.contactTypes.split(",").filter(v => v) : [],
                        assignmentGroups: json.assignmentGroups ? json.assignmentGroups.split(",").filter(v => v) : [],
                        customFields: json.customFieldsJson ? JSON.parse(json.customFieldsJson) : [],
                        slaThresholds: json.slaConfigJson ? JSON.parse(json.slaConfigJson) : initialSlaThresholds
                    });
                }
            } catch (err) {
                console.error("Error loading config:", err);
                alert("Could not load configuration. Check server or CORS settings.");
            } finally {
                setLoading(false);
            }
        };
        fetchConfig();
    }, []);

    // ------------------------------
    // Handlers
    // ------------------------------

    // Handles adding standard list items (statusOptions, categories, etc.)
    const handleAdd = (key) => {
        const value = fieldInput.trim();
        if (!value) return;
        setConfig((prev) => ({
            ...prev,
            [key]: [...prev[key], value]
        }));
        setFieldInput("");
    };
    
    // Handles removing standard list items
    const handleRemove = (key, valueToRemove) => {
        setConfig((prev) => ({
            ...prev,
            [key]: prev[key].filter(item => item !== valueToRemove)
        }));
    };

    // Handles adding custom fields
    const handleAddCustomField = () => {
        if (!customField.name.trim()) return;
        setConfig((prev) => ({
            ...prev,
            customFields: [...prev.customFields, { ...customField }]
        }));
        setCustomField({ name: "", type: "Text" });
    };

    // Handles removing custom fields
    const handleRemoveCustomField = (nameToRemove) => {
        setConfig((prev) => ({
            ...prev,
            customFields: prev.customFields.filter(f => f.name !== nameToRemove)
        }));
    };

    // Handles saving the entire configuration
    const handleSave = async () => {
        const payload = {
            approvalRequired: config.approvalWorkflowEnabled,
            auditTrailEnabled: config.auditTrailEnabled,
            priorityLevels: config.priorityLevels.join(","),
            impactLevels: config.impactLevels.join(","),
            urgencyLevels: config.urgencyLevels.join(","),
            statusOptions: config.statusOptions.join(","),
            categories: config.categories.join(","),
            contactTypes: config.contactTypes.join(","),
            assignmentGroups: config.assignmentGroups.join(","),
            customFieldsJson: JSON.stringify(config.customFields),
            slaConfigJson: JSON.stringify(config.slaThresholds)
        };

        try {
            const res = await fetch(`${API_BASE}/update`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include", 
                body: JSON.stringify(payload)
            });

            if (!res.ok) throw new Error("Failed to save config");

            alert("Configuration saved successfully!");
        } catch (err) {
            console.error("Save failed:", err);
            alert("Error saving configuration. Check server status.");
        }
    };

    // Function to format camelCase keys into display text
    const formatKey = (key) => {
        const result = key.replace(/([A-Z])/g, " $1");
        return result.charAt(0).toUpperCase() + result.slice(1);
    };

    if (loading) {
        return (
            <Container maxWidth="md" sx={{ py: 5, textAlign: 'center' }}>
                <CircularProgress />
                <Typography variant="body1" sx={{ mt: 2 }}>Loading configuration...</Typography>
            </Container>
        );
    }


    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Paper elevation={4} sx={{ p: { xs: 2, md: 4 } }}>
                <Box display="flex" alignItems="center" justifyContent="center" mb={4}>
                    <SettingsIcon color="primary" sx={{ fontSize: 30, mr: 1 }} />
                    <Typography variant="h5" component="h2" color="primary" sx={{ fontWeight: 'bold' }}>
                        Incident Module Attribute Configuration
                    </Typography>
                </Box>
                
                <Typography variant="subtitle1" align="center" color="text.secondary" mb={4}>
                    Define lists, levels, and thresholds for incident handling.
                </Typography>

                {/* --- Configurable Lists (Status, Priority, etc.) --- */}
                {[
                    "statusOptions",
                    "priorityLevels",
                    "impactLevels",
                    "urgencyLevels",
                    "categories",
                    "contactTypes",
                    "assignmentGroups"
                ].map((key) => (
                    <Box key={key} mb={4} p={2} border={1} borderColor="grey.300" borderRadius={1}>
                        <Typography variant="h6" sx={{ color: 'text.primary', mb: 2 }}>
                            {formatKey(key)}
                        </Typography>
                        <Grid container spacing={1} alignItems="center">
                            <Grid item xs={9}>
                                <TextField
                                    fullWidth
                                    size="small"
                                    label={`Enter new ${formatKey(key).toLowerCase()}`}
                                    value={fieldInput}
                                    onChange={(e) => setFieldInput(e.target.value)}
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter') {
                                            handleAdd(key);
                                        }
                                    }}
                                />
                            </Grid>
                            <Grid item xs={3}>
                                <Button
                                    fullWidth
                                    variant="contained"
                                    color="primary"
                                    onClick={() => handleAdd(key)}
                                    startIcon={<AddIcon />}
                                    size="medium"
                                >
                                    Add
                                </Button>
                            </Grid>
                        </Grid>
                        <Box mt={2} display="flex" flexWrap="wrap" gap={1}>
                            {config[key]?.length > 0 ? (
                                config[key].map((item, index) => (
                                    <Chip
                                        key={index}
                                        label={item}
                                        onDelete={() => handleRemove(key, item)}
                                        color="default"
                                        variant="outlined"
                                    />
                                ))
                            ) : (
                                <Typography variant="body2" color="text.secondary">None configured.</Typography>
                            )}
                        </Box>
                    </Box>
                ))}

                {/* --- SLA Thresholds --- */}
                <Box mb={4} p={2} border={1} borderColor="error.light" borderRadius={1}>
                    <Box display="flex" alignItems="center" mb={2}>
                        <TimeIcon color="error" sx={{ mr: 1 }} />
                        <Typography variant="h6" sx={{ color: 'text.primary' }}>
                            SLA Thresholds (Response & Resolution Time)
                        </Typography>
                    </Box>
                    <Grid container spacing={2}>
                        {Object.entries(config.slaThresholds).map(([priority, times]) => (
                            <Grid item xs={12} sm={6} md={4} key={priority}>
                                <Paper elevation={1} sx={{ p: 2, bgcolor: 'grey.50' }}>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>{priority}</Typography>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        label="Response (e.g., 15m)"
                                        value={times.response}
                                        onChange={(e) =>
                                            setConfig((prev) => ({
                                                ...prev,
                                                slaThresholds: {
                                                    ...prev.slaThresholds,
                                                    [priority]: { ...prev.slaThresholds[priority], response: e.target.value }
                                                }
                                            }))
                                        }
                                        margin="dense"
                                    />
                                    <TextField
                                        fullWidth
                                        size="small"
                                        label="Resolution (e.g., 4h)"
                                        value={times.resolution}
                                        onChange={(e) =>
                                            setConfig((prev) => ({
                                                ...prev,
                                                slaThresholds: {
                                                    ...prev.slaThresholds,
                                                    [priority]: { ...prev.slaThresholds[priority], resolution: e.target.value }
                                                }
                                            }))
                                        }
                                        margin="dense"
                                    />
                                </Paper>
                            </Grid>
                        ))}
                    </Grid>
                </Box>

                {/* --- Toggles --- */}
                <Box mb={4} p={2} border={1} borderColor="info.main" borderRadius={1} display="flex" flexDirection={{ xs: 'column', sm: 'row' }} gap={2}>
                    <FormControlLabel
                        control={
                            <Switch
                                checked={config.approvalWorkflowEnabled}
                                onChange={() =>
                                    setConfig((prev) => ({
                                        ...prev,
                                        approvalWorkflowEnabled: !prev.approvalWorkflowEnabled
                                    }))
                                }
                                color="primary"
                            />
                        }
                        label="Enable Approval Workflow"
                    />
                    <FormControlLabel
                        control={
                            <Switch
                                checked={config.auditTrailEnabled}
                                onChange={() =>
                                    setConfig((prev) => ({
                                        ...prev,
                                        auditTrailEnabled: !prev.auditTrailEnabled
                                    }))
                                }
                                color="primary"
                            />
                        }
                        label="Enable Audit Trail"
                    />
                </Box>

                {/* --- Custom Fields --- */}
                <Box mb={4} p={2} border={1} borderColor="success.main" borderRadius={1}>
                    <Typography variant="h6" sx={{ color: 'text.primary', mb: 2 }}>
                        Custom Fields
                    </Typography>
                    <Grid container spacing={2} alignItems="center" mb={2}>
                        <Grid item xs={12} sm={5}>
                            <TextField
                                fullWidth
                                size="small"
                                label="Field Name"
                                value={customField.name}
                                onChange={(e) => setCustomField({ ...customField, name: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Field Type</InputLabel>
                                <Select
                                    value={customField.type}
                                    label="Field Type"
                                    onChange={(e) => setCustomField({ ...customField, type: e.target.value })}
                                >
                                    <MenuItem value="Text">Text</MenuItem>
                                    <MenuItem value="Dropdown">Dropdown</MenuItem>
                                    <MenuItem value="Number">Number</MenuItem>
                                    <MenuItem value="Date">Date</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={3}>
                            <Button
                                fullWidth
                                variant="contained"
                                color="success"
                                onClick={handleAddCustomField}
                                startIcon={<AddIcon />}
                            >
                                Add
                            </Button>
                        </Grid>
                    </Grid>
                    <Box mt={2} display="flex" flexWrap="wrap" gap={1}>
                        {config.customFields.length > 0 ? (
                            config.customFields.map((f, index) => (
                                <Chip
                                    key={index}
                                    label={`${f.name} (${f.type})`}
                                    onDelete={() => handleRemoveCustomField(f.name)}
                                    color="success"
                                    variant="outlined"
                                />
                            ))
                        ) : (
                            <Typography variant="body2" color="text.secondary">None configured.</Typography>
                        )}
                    </Box>
                </Box>

                {/* Save Button */}
                <Box textAlign="center" mt={4}>
                    <Button
                        variant="contained"
                        color="success"
                        size="large"
                        onClick={handleSave}
                        startIcon={<SaveIcon />}
                        sx={{ minWidth: 200 }}
                    >
                        Save Configuration
                    </Button>
                </Box>
            </Paper>
        </Container>
    );
};

export default IncidentModuleConfig;