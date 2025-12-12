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
import FolderOffIcon from '@mui/icons-material/FolderOff';

/**
 * Basic table component for displaying a list of incidents.
 * NOTE: For full incident management (sorting, filtering, pagination), 
 * the MUI X DataGrid is recommended over this basic table structure.
 * * @param {object} props
 * @param {Array<object>} props.incidents - Array of incident objects.
 */
const IncidentTable = ({ incidents }) => {

    const columns = [
        { id: "id", label: "ID", minWidth: 100 },
        { id: "shortDescription", label: "Short Desc", minWidth: 200 },
        { id: "category", label: "Category", minWidth: 150 },
        { id: "status", label: "Status", minWidth: 100 },
        { id: "createdAt", label: "Created", minWidth: 100 },
        { id: "updated", label: "Updated", minWidth: 100 },
    ];

    return (
        <TableContainer component={Paper} elevation={3} sx={{ mt: 3, maxHeight: 500, overflowY: 'auto' }}>
            <Table stickyHeader size="small" aria-label="Incident List Table">
                
                {/* Table Header */}
                <TableHead>
                    <TableRow sx={{ bgcolor: 'grey.100' }}>
                        {columns.map((column) => (
                            <TableCell
                                key={column.id}
                                sx={{ 
                                    minWidth: column.minWidth, 
                                    fontWeight: 'bold',
                                    backgroundColor: 'grey.200' 
                                }}
                            >
                                {column.label}
                            </TableCell>
                        ))}
                    </TableRow>
                </TableHead>
                
                {/* Table Body */}
                <TableBody>
                    {incidents.length > 0 ? (
                        incidents.map((i) => (
                            <TableRow 
                                hover 
                                key={i.id} 
                                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                            >
                                <TableCell>
                                    <Typography variant="body2" color="primary">
                                        {i.id}
                                    </Typography>
                                </TableCell>
                                <TableCell>{i.shortDescription}</TableCell>
                                <TableCell>{i.category}</TableCell>
                                <TableCell>
                                    <Box 
                                        component="span" 
                                        sx={{ 
                                            // Example: Simple status badge styling
                                            bgcolor: i.status === 'Closed' ? 'success.light' : i.status === 'In Progress' ? 'warning.light' : 'info.light',
                                            color: i.status === 'Closed' ? 'success.dark' : i.status === 'In Progress' ? 'warning.dark' : 'info.dark',
                                            p: 0.5,
                                            borderRadius: 1,
                                            fontWeight: 600,
                                            fontSize: '0.75rem'
                                        }}
                                    >
                                        {i.status || "Open"}
                                    </Box>
                                </TableCell>
                                <TableCell>{i.createdAt}</TableCell>
                                <TableCell>{i.updated || "-"}</TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={columns.length} align="center" sx={{ py: 4 }}>
                                <FolderOffIcon color="disabled" sx={{ fontSize: 40, mb: 1 }} />
                                <Typography variant="subtitle1" color="text.secondary">
                                    No incidents found.
                                </Typography>
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default IncidentTable;