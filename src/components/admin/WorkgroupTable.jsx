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
    IconButton,
} from "@mui/material";
import { Edit, Delete, CheckCircle, Cancel, GroupWork } from "@mui/icons-material";

// Helper component to render boolean values as icons
const BooleanStatus = ({ value }) => (
    <Box component="span" sx={{ display: 'flex', alignItems: 'center' }}>
        {value ? (
            <CheckCircle fontSize="small" color="success" sx={{ mr: 0.5 }} />
        ) : (
            <Cancel fontSize="small" color="error" sx={{ mr: 0.5 }} />
        )}
        <Typography variant="body2" sx={{ color: value ? 'success.main' : 'error.main', fontWeight: 500 }}>
            {value ? 'True' : 'False'}
        </Typography>
    </Box>
);

/**
 * Component to display a list of Workgroups in a sortable/filterable table view.
 * * NOTE: For large datasets, MUI X DataGrid is recommended over the basic MUI Table.
 * @param {object} props
 * @param {Array<object>} props.data - Array of workgroup objects.
 * @param {function} props.onEdit - Handler for the Edit action.
 * @param {function} props.onDelete - Handler for the Delete action.
 */
const WorkgroupTable = ({ data, onEdit, onDelete }) => {
    return (
        <TableContainer component={Paper} elevation={3}>
            <Table sx={{ minWidth: 800 }} aria-label="workgroups table">
                {/* Table Header */}
                <TableHead>
                    <TableRow sx={{ bgcolor: 'primary.light', '& th': { color: 'white', fontWeight: 'bold' } }}>
                        <TableCell>ID</TableCell>
                        <TableCell>Workgroup Name</TableCell>
                        <TableCell>Display Name</TableCell>
                        <TableCell>Owner</TableCell>
                        <TableCell align="center">Master</TableCell>
                        <TableCell align="center">Default</TableCell>
                        <TableCell align="center">Active</TableCell>
                        <TableCell align="center">Actions</TableCell>
                    </TableRow>
                </TableHead>
                
                {/* Table Body */}
                <TableBody>
                    {data.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                                <GroupWork color="disabled" sx={{ fontSize: 40, mb: 1 }} />
                                <Typography variant="subtitle1" color="text.secondary">
                                    No Workgroups found. Start by creating one.
                                </Typography>
                            </TableCell>
                        </TableRow>
                    ) : (
                        data.map((wg) => (
                            <TableRow 
                                key={wg.id} 
                                sx={{ '&:last-child td, &:last-child th': { border: 0 }, '&:hover': { bgcolor: 'action.hover' } }}
                            >
                                <TableCell component="th" scope="row">
                                    <Typography variant="body2" color="text.secondary">{wg.id}</Typography>
                                </TableCell>
                                <TableCell>
                                    <Typography variant="body1" sx={{ fontWeight: 600, color: 'primary.main' }}>{wg.name}</Typography>
                                </TableCell>
                                <TableCell>{wg.displayName}</TableCell>
                                <TableCell>{wg.owner ? wg.owner.username : "-"}</TableCell>
                                <TableCell align="center">
                                    <BooleanStatus value={wg.master} />
                                </TableCell>
                                <TableCell align="center">
                                    <BooleanStatus value={wg.defaultWorkgroup} />
                                </TableCell>
                                <TableCell align="center">
                                    <BooleanStatus value={wg.active} />
                                </TableCell>
                                <TableCell align="center">
                                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                                        <IconButton 
                                            size="small" 
                                            color="primary" 
                                            onClick={() => onEdit(wg)}
                                            title="Edit Workgroup"
                                        >
                                            <Edit fontSize="small" />
                                        </IconButton>
                                        <IconButton 
                                            size="small" 
                                            color="error" 
                                            onClick={() => onDelete(wg.id)}
                                            title="Delete Workgroup"
                                        >
                                            <Delete fontSize="small" />
                                        </IconButton>
                                    </Box>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default WorkgroupTable;