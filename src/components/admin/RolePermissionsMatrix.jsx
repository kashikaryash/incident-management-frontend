import React from 'react';
import {
    Paper,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Checkbox,
    Box
} from '@mui/material';
import { Edit, Visibility } from '@mui/icons-material';

// Define the administrative modules whose permissions are being configured
const modules = [
    'Category', 
    'Classification', 
    'Closure Code', 
    'Priority', 
    'Impact', 
    'Urgency',
    'Users', // Added common module for more realism
    'Roles', // Added common module for more realism
];

/**
 * Component for displaying and managing a Role Permission Matrix.
 * * NOTE: This is a static UI representation. In a real application, 
 * * the checkboxes would need state management (useState) and logic 
 * * to fetch and save permission data associated with a specific role (prop).
 */
const RolePermissionsMatrix = () => {
    // In a production app, the component might receive 'roleId' or 'roleName' as props
    // and use useState/useEffect to load the current permissions for that role.
    
    // Example handler structure (mock):
    // const [permissions, setPermissions] = useState({});
    // const handlePermissionChange = (moduleName, action) => {
    //     // Logic to update state and call API
    // };

    return (
        <Paper elevation={3} sx={{ p: 4, maxWidth: 800, mx: 'auto' }}>
            <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                🔒 Role Permission Matrix
            </Typography>
            
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Configure View and Edit permissions for administrative data modules.
            </Typography>

            <TableContainer component={Paper} variant="outlined">
                <Table sx={{ minWidth: 500 }} aria-label="role permission matrix">
                    <TableHead>
                        <TableRow sx={{ bgcolor: 'grey.100' }}>
                            <TableCell sx={{ fontWeight: 'bold' }}>Module</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                                <Box display="flex" alignItems="center" justifyContent="center">
                                    <Visibility fontSize="small" sx={{ mr: 0.5 }} /> View
                                </Box>
                            </TableCell>
                            <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                                <Box display="flex" alignItems="center" justifyContent="center">
                                    <Edit fontSize="small" sx={{ mr: 0.5 }} /> Edit
                                </Box>
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {modules.map((mod) => (
                            <TableRow 
                                key={mod}
                                // Example: highlight rows on hover
                                sx={{ '&:last-child td, &:last-child th': { border: 0 }, '&:hover': { bgcolor: 'action.hover' } }}
                            >
                                <TableCell component="th" scope="row">
                                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                        {mod}
                                    </Typography>
                                </TableCell>
                                <TableCell align="center">
                                    {/* View Permission Checkbox */}
                                    <Checkbox 
                                        // checked={permissions[mod]?.view || false}
                                        // onChange={() => handlePermissionChange(mod, 'view')}
                                        color="primary"
                                    />
                                </TableCell>
                                <TableCell align="center">
                                    {/* Edit Permission Checkbox */}
                                    <Checkbox 
                                        // checked={permissions[mod]?.edit || false}
                                        // onChange={() => handlePermissionChange(mod, 'edit')}
                                        color="secondary"
                                    />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Paper>
    );
};

export default RolePermissionsMatrix;