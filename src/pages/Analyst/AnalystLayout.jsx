import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { Box, CssBaseline } from "@mui/material";
// Assuming AnalystSidebar is either already MUI-compatible or a simple wrapper
import AnalystSidebar from "../../components/AnalystSidebar";

// Define the width of the sidebar when open
const drawerWidth = 224; // Equivalent to ml-56 in Tailwind (56 * 4px = 224px)
const transitionDuration = 300;

export default function AnalystLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const handleToggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <Box sx={{ display: 'flex' }}>
      {/* CssBaseline is a MUI helper to smooth out CSS differences */}
      <CssBaseline />

      {/* Sidebar - Component is assumed to handle its own fixed positioning/drawer logic */}
      <AnalystSidebar
        isOpen={isSidebarOpen}
        onToggle={handleToggleSidebar}
        // Pass the calculated width to the sidebar component if it needs it
        drawerWidth={drawerWidth}
      />

      {/* Main Content Area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1, // Allows the main content to take up the remaining space
          p: 3, // Padding around the content (equivalent to p-6 / 24px)
          width: '100%',
          minHeight: '100vh',
          // Dynamic margin and transition based on sidebar state
          marginLeft: isSidebarOpen ? `${drawerWidth}px` : 0,
          transition: (theme) => 
            theme.transitions.create('margin', {
              easing: theme.transitions.easing.sharp,
              duration: transitionDuration,
            }),
        }}
      >
        {/* The content of the specific route (e.g., Dashboard, Incidents) */}
        <Outlet />
      </Box>
    </Box>
  );
}