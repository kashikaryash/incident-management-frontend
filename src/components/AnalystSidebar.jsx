import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { 
    Drawer, 
    List, 
    ListItemButton, 
    ListItemIcon, 
    ListItemText, 
    Typography, 
    Divider, 
    IconButton, 
    Box,
    Collapse,
} from "@mui/material";
import { 
    ChevronLeft, 
    ChevronRight, 
    Dashboard, 
    Assignment, 
    ThumbUp, 
    Feedback, 
    Person, 
    AddCircleOutline, 
    ListAlt, 
    WorkOutline 
} from "@mui/icons-material";
import { styled, useTheme } from '@mui/material/styles';

// --- 1. Drawer Styling Constants ---
const drawerWidth = 240;

// Styled Drawer for transition effect
const StyledDrawer = styled(Drawer, { shouldForwardProp: (prop) => prop !== 'open' })(
    ({ theme, open }) => ({
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            transition: theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
            }),
            overflowX: 'hidden',
            // Collapse behavior
            ...(open ? { 
                width: drawerWidth 
            } : {
                width: theme.spacing(7), // Adjust based on icon size
                [theme.breakpoints.up('sm')]: {
                    width: theme.spacing(9),
                },
                
            }),
            // Use z-index higher than app bar if needed
            zIndex: 1100, 
            position: 'fixed', // Ensure it stays fixed
        },
    }),
);

// --- 2. Main Component ---
export default function AnalystSidebar() {
    const theme = useTheme();
    const [isOpen, setIsOpen] = useState(true);
    const [user, setUser] = useState(null);

    // Get user info on mount
    useEffect(() => {
        const storedUser = sessionStorage.getItem("user");
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    // Helper function to define link styling based on active state
    const linkStyle = ({ isActive }) => ({
        textDecoration: 'none',
        color: 'inherit',
        ...(isActive && { 
            fontWeight: 600,
            color: theme.palette.primary.main, 
            backgroundColor: theme.palette.primary.lightest, 
            borderLeft: `4px solid ${theme.palette.primary.main}`
        }),
    });
    
    // --- Navigation Data Structure ---
    const navSections = [
        {
            title: "My Workspace",
            items: [
                { text: "Dashboard", icon: Dashboard, to: "/analyst/dashboard" },
                { text: "Assigned to Me", icon: Assignment, to: "/analyst/assigned-incidents" },
                { text: "Approve Incident Records", icon: ThumbUp, to: "/analyst/approve-incidents" },
                { text: "Feedback Moderation", icon: Feedback, to: "/analyst/feedback" },
            ]
        },
        {
            title: "My Requests",
            items: [
                { text: "Incidents I Raised", icon: ListAlt, to: "/analyst/incidentsIRaised" },
                { text: "Log New Incident", icon: AddCircleOutline, to: "/analyst/log-incident" },
            ]
        },
        {
            title: "Global Management",
            items: [
                { text: "All Incidents List", icon: Assignment, to: "/analyst/incidents" },
                { text: "Work Order List", icon: WorkOutline, to: "/analyst/work-orders" },
            ]
        }
    ];

    const toggleSidebar = () => setIsOpen(!isOpen);

    return (
        <Box sx={{ display: 'flex' }}>
            {/* Toggle Button (Always visible on the left edge) */}
            <IconButton
                onClick={toggleSidebar}
                color="inherit"
                sx={{
                    position: 'fixed',
                    left: isOpen ? `${drawerWidth}px` : theme.spacing(1), // Move with drawer or stay near edge
                    top: theme.spacing(2),
                    bgcolor: 'grey.800',
                    color: 'white',
                    zIndex: 1200, // Higher than drawer
                    '&:hover': { bgcolor: 'primary.dark' },
                    p: 0.5
                }}
            >
                {isOpen ? <ChevronLeft /> : <ChevronRight />}
            </IconButton>

            <StyledDrawer
                variant="permanent"
                open={isOpen}
            >
                <Box sx={{ p: 2 }}>
                    {/* User Heading */}
                    <Box 
                        component={NavLink} 
                        to="/analyst/dashboard"
                        sx={{
                            display: 'flex', 
                            alignItems: 'center', 
                            mb: 2, 
                            textDecoration: 'none',
                            cursor: 'pointer',
                            color: 'text.primary',
                            '&:hover': { color: 'primary.main' }
                        }}
                    >
                        <Person sx={{ mr: 1, color: 'primary.main' }} />
                        {isOpen && (
                            <Typography variant="subtitle1" component="span" sx={{ fontWeight: 600 }}>
                                {user ? user.name : "Analyst User"}
                            </Typography>
                        )}
                    </Box>
                    <Divider sx={{ mb: 3 }} />

                    {/* Navigation Links */}
                    {navSections.map((section, index) => (
                        <Box key={index} sx={{ mb: 4 }}>
                            {isOpen && (
                                <Typography 
                                    variant="caption" 
                                    color="text.secondary" 
                                    sx={{ fontWeight: 700, mb: 1.5, display: 'block', textTransform: 'uppercase' }}
                                >
                                    {section.title}
                                </Typography>
                            )}
                            <List dense disablePadding>
                                {section.items.map((item) => (
                                    <NavLink key={item.to} to={item.to} style={linkStyle}>
                                        <ListItemButton sx={{ minHeight: 48, py: 0.5, px: 2, justifyContent: isOpen ? 'initial' : 'center' }}>
                                            <ListItemIcon sx={{ minWidth: 0, mr: isOpen ? 1 : 'auto', justifyContent: 'center', color: 'inherit' }}>
                                                <item.icon />
                                            </ListItemIcon>
                                            {isOpen && <ListItemText primary={item.text} sx={{ opacity: isOpen ? 1 : 0 }} />}
                                        </ListItemButton>
                                    </NavLink>
                                ))}
                            </List>
                        </Box>
                    ))}
                </Box>
            </StyledDrawer>
            
            {/* Filler space to push content over when the sidebar is open */}
             <Box sx={{ width: isOpen ? drawerWidth : theme.spacing(9), transition: theme.transitions.create('width') }} />
        </Box>
    );
}