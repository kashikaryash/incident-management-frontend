import React, { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  AppBar,
  Box,
  CssBaseline,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Button,
  Collapse,
} from "@mui/material";
import {
  Menu as MenuIcon,
  People,
  Security,
  UploadFile,
  Dns, // Infrastructure
  ReportProblem, // Incidents
  Settings, // Config
  ExpandLess,
  ExpandMore,
  Dashboard,
  Logout,
} from "@mui/icons-material";

const drawerWidth = 260;

// Define your menu structure here for easy management
const MENU_ITEMS = [
  {
    title: "User Management",
    icon: <People />,
    children: [
      { label: "Users", route: "users" },
      { label: "Roles", route: "roles" },
      { label: "Import Data", route: "import", icon: <UploadFile /> },
    ],
  },
  {
    title: "Infrastructure",
    icon: <Dns />,
    children: [
      { label: "Workgroups", route: "workgroup-management" },
    ],
  },
  {
    title: "Incident Masters",
    icon: <ReportProblem />,
    children: [
      { label: "All Incidents", route: "all-incidents" },
      { label: "Category", route: "category" },
      { label: "Classification", route: "classification" },
      { label: "Closure Codes", route: "closure-codes" },
    ],
  },
  {
    title: "SLA Configurations",
    icon: <Security />, // Placeholder icon
    children: [
      { label: "Impact", route: "impact" },
      { label: "Priority", route: "priority" },
      { label: "SLA Matrix", route: "sla-matrix-ci" },
    ],
  },
  {
    title: "Other Config",
    icon: <Settings />,
    children: [
      { label: "Cost Config", route: "cost-config" },
      { label: "Feedback Config", route: "feedback-config" },
    ],
  },
];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  
  // State to handle collapsible menus
  const [openMenus, setOpenMenus] = useState({});

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenuClick = (title) => {
    setOpenMenus((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  const handleSignOut = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const drawerContent = (
    <div>
      <Toolbar sx={{ backgroundColor: '#1976d2', color: 'white' }}>
        <Typography variant="h6" noWrap component="div">
          Admin Panel
        </Typography>
      </Toolbar>
      <Divider />
      <List component="nav">
        {MENU_ITEMS.map((section) => (
          <React.Fragment key={section.title}>
            {/* Parent Item */}
            <ListItemButton onClick={() => handleMenuClick(section.title)}>
              <ListItemIcon>{section.icon}</ListItemIcon>
              <ListItemText primary={section.title} />
              {openMenus[section.title] ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
            
            {/* Child Items (Collapsible) */}
            <Collapse in={openMenus[section.title]} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {section.children.map((child) => (
                  <ListItemButton
                    key={child.route}
                    sx={{ pl: 4 }}
                    selected={location.pathname.includes(child.route)}
                    onClick={() => navigate(child.route)}
                  >
                    <ListItemText primary={child.label} />
                  </ListItemButton>
                ))}
              </List>
            </Collapse>
          </React.Fragment>
        ))}
      </List>
    </div>
  );

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      
      {/* Top Header */}
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: "none" } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Dashboard
          </Typography>
          <Button color="inherit" startIcon={<Logout />} onClick={handleSignOut}>
            Sign Out
          </Button>
        </Toolbar>
      </AppBar>

      {/* Sidebar (Responsive) */}
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        {/* Mobile Drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: "block", sm: "none" },
            "& .MuiDrawer-paper": { boxSizing: "border-box", width: drawerWidth },
          }}
        >
          {drawerContent}
        </Drawer>
        
        {/* Desktop Drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", sm: "block" },
            "& .MuiDrawer-paper": { boxSizing: "border-box", width: drawerWidth },
          }}
          open
        >
          {drawerContent}
        </Drawer>
      </Box>

      {/* Main Content Area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          backgroundColor: "#f5f5f5", // Light grey background
          minHeight: "100vh",
        }}
      >
        <Toolbar /> {/* Spacer to push content below AppBar */}
        
        {/* This is where your nested routes (Users, Roles, Incidents) will appear */}
        <Outlet />
        
      </Box>
    </Box>
  );
};

export default AdminDashboard;