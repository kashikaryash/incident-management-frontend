import React from 'react';
import { 
    AppBar, 
    Toolbar, 
    Typography, 
    Box, 
    useTheme 
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';

/**
 * Standard application header/navigation bar for the Admin Dashboard, styled with Material UI.
 */
const Navbar = () => {
    const theme = useTheme();

    return (
        // AppBar provides the background color, shadow (elevation), and fixed positioning
        <AppBar 
            position="sticky" // Keeps the bar visible at the top while scrolling
            elevation={4}
            sx={{ 
                bgcolor: 'primary.main', // Uses the primary theme color
                zIndex: theme.zIndex.drawer + 1, // Ensures it sits above the sidebar drawer
            }}
        >
            <Toolbar disableGutters> 
                <Box sx={{ 
                    maxWidth: 1280, // max-w-7xl equivalent
                    width: '100%',
                    mx: 'auto', 
                    px: 2,
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center' 
                }}>
                    {/* Dashboard Title */}
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <DashboardIcon sx={{ mr: 1, color: 'white' }} />
                        <Typography 
                            variant="h6" 
                            component="div"
                            sx={{ fontWeight: 600, color: 'white' }}
                        >
                            Admin Dashboard
                        </Typography>
                    </Box>

                    {/* Welcome Message */}
                    <Typography 
                        variant="body2" 
                        component="span"
                        sx={{ color: 'white' }}
                    >
                        Welcome, Admin
                    </Typography>
                </Box>
            </Toolbar>
        </AppBar>
    );
};

export default Navbar;