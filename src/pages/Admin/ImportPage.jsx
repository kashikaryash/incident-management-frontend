import React, { useState } from "react";
import {
  Container,
  Paper,
  Typography,
  Button,
  Box,
  TextField,
  Input,
  Alert,
} from "@mui/material";
import { UploadFile as UploadFileIcon, Group as GroupIcon, AssignmentInd as RoleIcon } from '@mui/icons-material';

const ImportPage = () => {
  const [userFile, setUserFile] = useState(null);
  const [roleFile, setRoleFile] = useState(null);
  const [userUploadStatus, setUserUploadStatus] = useState(null); // success, error, null
  const [roleUploadStatus, setRoleUploadStatus] = useState(null); // success, error, null

  const handleUserFileChange = (e) => {
    setUserFile(e.target.files[0]);
    setUserUploadStatus(null);
  };

  const handleRoleFileChange = (e) => {
    setRoleFile(e.target.files[0]);
    setRoleUploadStatus(null);
  };

  const handleUploadUsers = () => {
    if (!userFile) {
      alert("Please select a user file to upload");
      return;
    }
    
    // --- API Call Placeholder ---
    console.log(`Uploading user file: ${userFile.name}`);
    
    // Simulate API call success/failure
    setTimeout(() => {
        // Replace with actual axios call logic here
        const success = Math.random() > 0.3; // Simulate success 70% of the time
        if (success) {
            setUserUploadStatus('success');
            console.log("User upload successful.");
        } else {
            setUserUploadStatus('error');
            console.error("User upload failed.");
        }
        setUserFile(null); // Clear file input after attempt
    }, 1500);
    // ----------------------------
  };

  const handleUploadRoles = () => {
    if (!roleFile) {
      alert("Please select a role file to upload");
      return;
    }
    
    // --- API Call Placeholder ---
    console.log(`Uploading role file: ${roleFile.name}`);

    // Simulate API call success/failure
    setTimeout(() => {
        // Replace with actual axios call logic here
        const success = Math.random() > 0.5; // Simulate success 50% of the time
        if (success) {
            setRoleUploadStatus('success');
            console.log("Role upload successful.");
        } else {
            setRoleUploadStatus('error');
            console.error("Role upload failed.");
        }
        setRoleFile(null); // Clear file input after attempt
    }, 1500);
    // ----------------------------
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 'bold' }}>
        🚀 Data Import Center
      </Typography>

      {/* Import Users Section */}
      <Paper elevation={4} sx={{ p: 3, mb: 4, borderLeft: '5px solid', borderColor: 'primary.main' }}>
        <Box display="flex" alignItems="center" mb={2}>
            <GroupIcon color="primary" sx={{ mr: 1 }} />
            <Typography variant="h6" component="h3" sx={{ fontWeight: 'medium' }}>
                Import Users
            </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Input 
                type="file" 
                onChange={handleUserFileChange} 
                inputProps={{ accept: ".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }}
                sx={{ flexGrow: 1 }}
            />
            <Button
                variant="contained"
                color="primary"
                onClick={handleUploadUsers}
                disabled={!userFile}
                startIcon={<UploadFileIcon />}
            >
                {userFile ? `Upload (${userFile.name.substring(0, 10)}...)` : 'Select File'}
            </Button>
        </Box>

        {userUploadStatus === 'success' && (
            <Alert severity="success" sx={{ mt: 2 }}>
                Users imported successfully!
            </Alert>
        )}
        {userUploadStatus === 'error' && (
            <Alert severity="error" sx={{ mt: 2 }}>
                User import failed. Please check the file format and try again.
            </Alert>
        )}
      </Paper>

      {/* Import Roles Section */}
      <Paper elevation={4} sx={{ p: 3, borderLeft: '5px solid', borderColor: 'secondary.main' }}>
        <Box display="flex" alignItems="center" mb={2}>
            <RoleIcon color="secondary" sx={{ mr: 1 }} />
            <Typography variant="h6" component="h3" sx={{ fontWeight: 'medium' }}>
                Import Roles
            </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Input 
                type="file" 
                onChange={handleRoleFileChange} 
                inputProps={{ accept: ".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }}
                sx={{ flexGrow: 1 }}
            />
            <Button
                variant="contained"
                color="secondary"
                onClick={handleUploadRoles}
                disabled={!roleFile}
                startIcon={<UploadFileIcon />}
            >
                {roleFile ? `Upload (${roleFile.name.substring(0, 10)}...)` : 'Select File'}
            </Button>
        </Box>

        {roleUploadStatus === 'success' && (
            <Alert severity="success" sx={{ mt: 2 }}>
                Roles imported successfully!
            </Alert>
        )}
        {roleUploadStatus === 'error' && (
            <Alert severity="error" sx={{ mt: 2 }}>
                Role import failed. Please check the file format and try again.
            </Alert>
        )}
      </Paper>
    </Container>
  );
};

export default ImportPage;