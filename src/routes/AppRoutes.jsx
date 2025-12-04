// src/routes/AppRoutes.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import EndUserDashboard from '../pages/EndUser/EndUserDashboard';
import AnalystSlaDashboard from '../pages/Analyst/AnalystSlaDashboard';
import LogIncident from '../pages/Analyst/LogIncident';
import LogIncidentEndUser from '../pages/EndUser/LogIncidentEndUser';
import IncidentModuleConfig from '../pages/Admin/IncidentModuleConfig';
import LoginPage from '../pages/LoginPage';
import ProtectedRoute from '../components/ProtectedRoute';
import AdminRoleManagement from '../pages/Admin/RoleManagement/AdminRoleManagement';
import ForgotPassword from '../components/ForgotPassword';
import ResetPassword from '../components/ResetPassword';
import UserListPage from '../pages/Admin/User/UserListPage';
import AdminDashboard from '../pages/Admin/AdminDashboard';
import Signup from '../pages/Signup';
import ForgotUsernamePage from '../pages/ForgotUsernamePage';
import AllIncidentsPage from '../pages/Admin/IncidentAdmin/AllIncidentsPage';
import MyIncidents from '../pages/EndUser/MyIncidents';
import IncidentDetails from '../pages/Analyst/AnalystMyIncidents';

import ClassificationPage from '../pages/Admin/Classification/ClassificationPage';
import PendingReasonPage from '../pages/Admin/PendingReason/PendingReasonPage';
import ResolutionCodePage from '../pages/Admin/ResolutionCode/ResolutionCodePage';
import ImpactPage from "../pages/Admin/Impact/ImpactPage";

import IncidentResolvePage from '../pages/Analyst/IncidentResolvePage';
import AnalystAllIncidents from '../pages/Analyst/AnalystAllIncidents';
import AnalystLayout from '../pages/Analyst/AnalystLayout';
import AnalystMyIncidents from '../pages/Analyst/AnalystMyIncidents';
import CategoryManagementPage from '../pages/Admin/CategoryManagement/CategoryManagementPage';
import ClosureCodePage from '../pages/Admin/ClosureCode/ClosureCodePage';
import WorkgroupManagementPage from '../pages/Admin/Workgroup/WorkgroupManagementPage';
import IncidentSuccessModal from '../components/Analyst/IncidentSuccessModal';
import IncidentsIRaised from '../pages/Analyst/IncidentsIRaised';
import PriorityPage from '../pages/Admin/Priority/PriorityPage';
import AssignedToMeIncidents from '../pages/Analyst/AssignedToMeIncidents';
import ImportPage from '../pages/Admin/ImportPage';

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LoginPage />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-username" element={<ForgotUsernamePage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* End-User Routes */}
        <Route path="/user/dashboard" element={
          <ProtectedRoute allowedRoles={['USER']}>
            <EndUserDashboard />
          </ProtectedRoute>
        } />
        <Route path="/user/log-incident" element={
          <ProtectedRoute allowedRoles={['USER']}>
            <LogIncidentEndUser />
          </ProtectedRoute>
        } />
        <Route path="/user/incidents" element={
          <ProtectedRoute allowedRoles={['USER']}>
            <MyIncidents />
          </ProtectedRoute>
        } />

        {/* Analyst Routes */}
        <Route path="/analyst" element={
          <ProtectedRoute allowedRoles={['ANALYST']}>
            <AnalystLayout />
          </ProtectedRoute>
        }>
          <Route path="dashboard" element={<AnalystSlaDashboard />} />
          <Route path="log-incident" element={<LogIncident />} />
          <Route path="incidents" element={<AnalystAllIncidents />} />
          <Route path="incident/:id/resolve" element={<IncidentResolvePage />} />
          <Route path="myIncidents" element={<AnalystMyIncidents />} />
          <Route path="assigned-incidents" element={<AssignedToMeIncidents />} />
          <Route path="incidentsIRaised" element={<IncidentsIRaised />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminDashboard />
          </ProtectedRoute>
        }>
          {/* User & Role Management */}
          <Route path="users" element={<UserListPage />} />
          <Route path="roles" element={<AdminRoleManagement />} />
          <Route path="user-management" element={<UserListPage />} />
          <Route path="import" element={<ImportPage />} />
          {/* Incident Masters */}
          <Route path="category" element={<CategoryManagementPage />} />
          <Route path="classification" element={<ClassificationPage />} />
          <Route path="checklist" element={<div>Checklist Page</div>} />
          <Route path="closure-codes" element={<ClosureCodePage />} />
          <Route path="pending-reasons" element={<PendingReasonPage />} />
          <Route path="resolution-codes" element={<ResolutionCodePage />} />

          {/* SLA Configurations */}
          <Route path="impact" element={<ImpactPage />} />
          <Route path="sla-matrix-ci" element={<div>SLA Matrix By CI</div>} />
          <Route path="priority" element={<PriorityPage />} />
          <Route path="priority-matrix" element={<div>Priority Matrix</div>} />
          <Route path="workgroup-sla" element={<div>Workgroup SLA Window</div>} />
          <Route path="sla-service" element={<div>SLA Service Window</div>} />
          <Route path="sla-matrix" element={<div>SLA Matrix</div>} />
          <Route path="urgency" element={<div>Urgency Page</div>} />

          {/* Others */}
          <Route path="cost-config" element={<div>Cost Configuration</div>} />
          <Route path="feedback-config" element={<div>Feedback Configuration</div>} />
          <Route path="etr-email" element={<div>ETR Email Notification</div>} />
          <Route path="status-config" element={<div>Status Configuration</div>} />
          <Route path="email-notification" element={<div>Email Notification</div>} />
          <Route path="sms-notification" element={<div>SMS Notification</div>} />
          <Route path="voice-call" element={<div>Voice Call Notification</div>} />
          <Route path="info-ticker" element={<div>Information Ticker</div>} />
          <Route path="major-incident" element={<div>Major Incident</div>} />
          <Route path="rule" element={<div>Rule Page</div>} />
          <Route path="user-type" element={<div>User Type</div>} />
          <Route path="auto-workorder" element={<div>Auto Work Order Config</div>} />
          <Route path="sop" element={<div>SOP Configuration</div>} />
          <Route path="evaluator-config" element={<div>Evaluator Configuration</div>} />
          <Route path="approver-group" element={<div>Approver Group</div>} />
          <Route path="approval-config" element={<div>Approval Configuration</div>} />

          {/* TFS */}
          <Route path="tfs-config" element={<div>TFS Config</div>} />
          <Route path="workitem-field" element={<div>Work Item Field</div>} />
          <Route path="value-mapping" element={<div>Value Mapping</div>} />
          <Route path="profile-mapping" element={<div>Profile Mapping</div>} />
          <Route path="tfs-profile" element={<div>TFS Profile Mapping</div>} />

          {/* Incident Admin */}
          <Route path="all-incidents" element={<AllIncidentsPage />} />
          <Route path="workgroup-management" element={<WorkgroupManagementPage />} />
          <Route path="incident-config" element={<IncidentModuleConfig />} />
        </Route>

        {/* Misc Routes */}
        <Route path="/unauthorized" element={<div className="text-center text-red-600 p-4">🚫 Unauthorized Access</div>} />
        <Route path="*" element={<div className="p-8 text-center text-red-600">404 - Page Not Found</div>} />

        {/* Incident Success Example */}
        <Route
          path="/incident-success"
          element={
            <IncidentSuccessModal
              visible={true}
              incident={{
                id: "INC-TEST-12345",
                priority: "P3",
                serviceWindow: "24/5 Support",
              }}
              onClose={() => window.history.back()}
              onViewDashboard={() => window.location.assign("/user/dashboard")}
              onNewIncident={() => window.location.assign("/user/log-incident")}
            />
          }
        />
      </Routes>
    </Router>
  );
};

export default AppRoutes;
