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
  Logout,
} from "@mui/icons-material";

const drawerWidth = 260;

// Menu structure aligned with AppRoutes
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
      { label: "Pending Reasons", route: "pending-reasons" },
      { label: "Resolution Codes", route: "resolution-codes" },
    ],
  },
  {
    title: "SLA Configurations",
    icon: <Security />,
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
      { label: "ETR Email", route: "etr-email" },
      { label: "Status Config", route: "status-config" },
      { label: "Email Notification", route: "email-notification" },
      { label: "SMS Notification", route: "sms-notification" },
      { label: "Voice Call", route: "voice-call" },
      { label: "Info Ticker", route: "info-ticker" },
      { label: "Major Incident", route: "major-incident" },
      { label: "Rule", route: "rule" },
      { label: "User Type", route: "user-type" },
      { label: "Auto Workorder", route: "auto-workorder" },
      { label: "SOP", route: "sop" },
      { label: "Evaluator Config", route: "evaluator-config" },
      { label: "Approver Group", route: "approver-group" },
      { label: "Approval Config", route: "approval-config" },
      { label: "TFS Config", route: "tfs-config" },
      { label: "Workitem Field", route: "workitem-field" },
      { label: "Value Mapping", route: "value-mapping" },
      { label: "Profile Mapping", route: "profile-mapping" },
      { label: "TFS Profile", route: "tfs-profile" },
    ],
  },
];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openMenus, setOpenMenus] = useState({});

  // Toggle mobile drawer
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // Toggle collapsible menu
  const handleMenuClick = (title) => {
    setOpenMenus((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  // Sign out function
  const handleSignOut = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  // Sidebar content
  const drawerContent = (
    <div>
      <Toolbar sx={{ backgroundColor: "#1976d2", color: "white" }}>
        <Typography variant="h6" noWrap component="div">
          Admin Panel
        </Typography>
      </Toolbar>
      <Divider />
      <List component="nav">
        {MENU_ITEMS.map((section) => (
          <React.Fragment key={section.title}>
            {/* Parent menu */}
            <ListItemButton onClick={() => handleMenuClick(section.title)}>
              <ListItemIcon>{section.icon}</ListItemIcon>
              <ListItemText primary={section.title} />
              {openMenus[section.title] ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>

            {/* Child menu items */}
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

      {/* Top AppBar */}
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

      {/* Sidebar Drawer */}
      <Box component="nav" sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}>
        {/* Mobile drawer */}
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

        {/* Desktop drawer */}
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

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          backgroundColor: "#f5f5f5",
          minHeight: "100vh",
        }}
      >
        <Toolbar /> {/* Push content below AppBar */}
        <Outlet /> {/* Nested routes will render here */}
      </Box>
    </Box>
  );
};

export default AdminDashboard;
