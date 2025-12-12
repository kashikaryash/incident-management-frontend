import React from 'react';
import { 
    Box, 
    Typography, 
    Paper, 
    List, 
    ListItem, 
    ListItemText, 
    Switch, 
    FormControlLabel, 
    Divider 
} from '@mui/material';

// Define the fields that can be configured
const fields = [
    'Category', 
    'Impact', 
    'Urgency', 
    'Description', 
    'Attachments', 
    'Priority', // Added a common field for completeness
    'AssignedTo' // Added a field common for Analyst views
];

/**
 * Component for configuring the visibility of fields on the "Log Incident" form.
 * * NOTE: This is currently a visual mock. In a real application, 
 * the Switch components would need state management (useState) and
 * an API call (useEffect) to fetch and save the actual configuration.
 */
const FieldVisibilityConfig = () => {
    // In a real application, you would manage state here:
    // const [config, setConfig] = useState({});
    // useEffect(() => { loadConfig(); }, []); 
    // const handleToggle = (field) => { /* logic to update config state and call API */ };

    return (
        <Paper elevation={3} sx={{ p: 4, maxWidth: 600, mx: 'auto' }}>
            <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                ⚙️ Log Incident Field Configuration
            </Typography>

            <List dense>
                {fields.map((field, index) => (
                    <React.Fragment key={field}>
                        <ListItem 
                            secondaryAction={
                                // This is the control element (Switch)
                                <FormControlLabel
                                    control={
                                        <Switch 
                                            // For a mock, the checked state is just set to true 
                                            // In reality, it would be checked={config[field]}
                                            checked={true}
                                            // onChange={() => handleToggle(field)} 
                                            name={`config-${field}`}
                                            color="primary"
                                        />
                                    }
                                    // The label is hidden here since the primary text is the field name
                                    label=""
                                />
                            }
                            sx={{ py: 1 }}
                        >
                            {/* Primary text shows the field name */}
                            <ListItemText 
                                primary={
                                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                        {field}
                                    </Typography>
                                }
                                secondary={`Controls visibility of the ${field} field on the user form.`}
                            />
                        </ListItem>
                        {index < fields.length - 1 && <Divider component="li" />}
                    </React.Fragment>
                ))}
            </List>
            
            <Box sx={{ mt: 3, textAlign: 'right' }}>
                <Typography variant="caption" color="text.secondary">
                    Changes require a separate save/submit button in a production environment.
                </Typography>
            </Box>
        </Paper>
    );
};

export default FieldVisibilityConfig;