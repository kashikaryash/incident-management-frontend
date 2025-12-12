import React, { useState } from "react";
import { 
    Button, 
    Menu, 
    MenuItem, 
    ListItemIcon, 
    Typography, 
    Box 
} from "@mui/material";
import { ArrowDropDown } from "@mui/icons-material";

/**
 * MUI Dropdown Menu component for navigation (e.g., in a sidebar).
 * * @param {object} props
 * @param {string} props.label - The text label for the main dropdown button.
 * @param {Array<object>} props.menuItems - Array of objects: [{ label: string, route: string, Icon: ReactComponent (optional) }]
 * @param {function} props.navigateHandler - Function to handle routing when a menu item is clicked.
 */
const DropdownMenu = ({ label, menuItems, navigateHandler }) => {
    // anchorEl is used by MUI Menu to know where to position the dropdown
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);

    // Handler to open the menu
    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    // Handler to close the menu
    const handleClose = () => {
        setAnchorEl(null);
    };
    
    // Handler for item selection and navigation
    const handleMenuItemClick = (route) => {
        navigateHandler(route);
        handleClose();
    };

    return (
        <Box sx={{ width: '100%' }}>
            {/* 1. Dropdown Button */}
            <Button
                id={`dropdown-button-${label}`}
                aria-controls={open ? `dropdown-menu-${label}` : undefined}
                aria-haspopup="true"
                aria-expanded={open ? 'true' : undefined}
                onClick={handleClick}
                fullWidth
                sx={{ 
                    justifyContent: 'flex-start', // Align text to the left
                    textTransform: 'none',
                    py: 1.5,
                    px: 2,
                    color: 'text.primary',
                    '&:hover': {
                        bgcolor: 'primary.main',
                        color: 'white',
                    }
                }}
                endIcon={<ArrowDropDown />}
            >
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {label}
                </Typography>
            </Button>

            {/* 2. Dropdown Menu */}
            <Menu
                id={`dropdown-menu-${label}`}
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                MenuListProps={{
                    'aria-labelledby': `dropdown-button-${label}`,
                }}
                // This keeps the menu width the same as the button
                slotProps={{
                    paper: {
                        style: {
                            width: anchorEl ? anchorEl.clientWidth : undefined,
                        }
                    }
                }}
            >
                {menuItems.map((item) => (
                    <MenuItem 
                        key={item.label} 
                        onClick={() => handleMenuItemClick(item.route)}
                    >
                        {/* Optional Icon support */}
                        {item.Icon && (
                            <ListItemIcon>
                                <item.Icon fontSize="small" />
                            </ListItemIcon>
                        )}
                        <Typography variant="inherit">{item.label}</Typography>
                    </MenuItem>
                ))}
            </Menu>
        </Box>
    );
};

export default DropdownMenu;