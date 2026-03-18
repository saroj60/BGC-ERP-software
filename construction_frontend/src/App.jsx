import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import ProjectList from './pages/ProjectList';
import ProjectDetails from './pages/ProjectDetails';
import ProjectForm from './pages/ProjectForm';
import DailyReportForm from './pages/DailyReportForm';
import DailyReportList from './pages/DailyReportList';
import AttendanceForm from './pages/AttendanceForm';
import AttendanceList from './pages/AttendanceList';
import MaterialRequestForm from './pages/MaterialRequestForm';
import MaterialApprovalList from './pages/MaterialApprovalList';
import TaskManager from './pages/TaskManager';
import TenderList from './pages/TenderList';
import TenderDetails from './pages/TenderDetails';
import TenderForm from './pages/TenderForm';

// HR Modules
import HRDashboard from './pages/hr/HRDashboard';
import EmployeeDirectory from './pages/hr/EmployeeDirectory';
import RecruitmentBoard from './pages/hr/RecruitmentBoard';
import TrainingManager from './pages/hr/TrainingManager';
import PerformanceDashboard from './pages/hr/PerformanceDashboard';

import ExpenseForm from './pages/ExpenseForm';
import ExpenseList from './pages/ExpenseList';
import Dashboard from './pages/Dashboard';
import UserList from './pages/UserList';
import UserForm from './pages/UserForm';
import WorkerList from './pages/WorkerList';
import VehicleList from './pages/VehicleList';
import VehicleForm from './pages/VehicleForm';
import VehicleDetail from './pages/VehicleDetail';
import Analytics from './pages/Analytics';
import Inventory from './pages/Inventory';

import Layout from './components/Layout';

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('access_token');
  // Pass children to Layout only if authenticated
  return token ? <Layout>{children}</Layout> : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/projects"
          element={
            <PrivateRoute>
              <ProjectList />
            </PrivateRoute>
          }
        />
        <Route
          path="/projects/:id"
          element={
            <PrivateRoute>
              <ProjectDetails />
            </PrivateRoute>
          }
        />
        <Route
          path="/projects/new"
          element={
            <PrivateRoute>
              <ProjectForm />
            </PrivateRoute>
          }
        />
        <Route
          path="/projects/:id/edit"
          element={
            <PrivateRoute>
              <ProjectForm />
            </PrivateRoute>
          }
        />

        <Route
          path="/reports"
          element={
            <PrivateRoute>
              <DailyReportList />
            </PrivateRoute>
          }
        />
        <Route
          path="/reports/new"
          element={
            <PrivateRoute>
              <DailyReportForm />
            </PrivateRoute>
          }
        />
        <Route
          path="/attendance"
          element={
            <PrivateRoute>
              <AttendanceList />
            </PrivateRoute>
          }
        />
        <Route
          path="/attendance/new"
          element={
            <PrivateRoute>
              <AttendanceForm />
            </PrivateRoute>
          }
        />

        <Route
          path="/materials"
          element={
            <PrivateRoute>
              <MaterialApprovalList />
            </PrivateRoute>
          }
        />
        <Route
          path="/materials/new"
          element={
            <PrivateRoute>
              <MaterialRequestForm />
            </PrivateRoute>
          }
        />
        <Route
          path="/materials/approvals"
          element={
            <PrivateRoute>
              <MaterialApprovalList />
            </PrivateRoute>
          }
        />
        <Route
          path="/expenses"
          element={
            <PrivateRoute>
              <ExpenseList />
            </PrivateRoute>
          }
        />
        <Route
          path="/expenses/new"
          element={
            <PrivateRoute>
              <ExpenseForm />
            </PrivateRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/analytics"
          element={
            <PrivateRoute>
              <Analytics />
            </PrivateRoute>
          }
        />
        <Route
          path="/tasks"
          element={
            <PrivateRoute>
              <TaskManager />
            </PrivateRoute>
          }
        />
        <Route
          path="/tenders"
          element={
            <PrivateRoute>
              <TenderList />
            </PrivateRoute>
          }
        />
        <Route
          path="/tenders/new"
          element={
            <PrivateRoute>
              <TenderForm />
            </PrivateRoute>
          }
        />
        <Route
          path="/tenders/:id"
          element={
            <PrivateRoute>
              <TenderDetails />
            </PrivateRoute>
          }
        />

        {/* HR Routes */}
        <Route path="/hr" element={<PrivateRoute><HRDashboard /></PrivateRoute>} />
        <Route path="/hr/employees" element={<PrivateRoute><EmployeeDirectory /></PrivateRoute>} />
        <Route path="/hr/recruitment" element={<PrivateRoute><RecruitmentBoard /></PrivateRoute>} />
        <Route path="/hr/training" element={<PrivateRoute><TrainingManager /></PrivateRoute>} />
        <Route path="/hr/performance" element={<PrivateRoute><PerformanceDashboard /></PrivateRoute>} />

        <Route
          path="/workers"
          element={
            <PrivateRoute>
              <WorkerList />
            </PrivateRoute>
          }
        />
        <Route
          path="/users"
          element={
            <PrivateRoute>
              <UserList />
            </PrivateRoute>
          }
        />
        <Route
          path="/users/new"
          element={
            <PrivateRoute>
              <UserForm />
            </PrivateRoute>
          }
        />
        <Route
          path="/inventory"
          element={
            <PrivateRoute>
              <Inventory />
            </PrivateRoute>
          }
        />
        <Route
          path="/vehicles"
          element={
            <PrivateRoute>
              <VehicleList />
            </PrivateRoute>
          }
        />
        <Route
          path="/vehicles/new"
          element={
            <PrivateRoute>
              <VehicleForm />
            </PrivateRoute>
          }
        />
        <Route
          path="/vehicles/:id/edit"
          element={
            <PrivateRoute>
              <VehicleForm />
            </PrivateRoute>
          }
        />
        <Route
          path="/vehicles/:id"
          element={
            <PrivateRoute>
              <VehicleDetail />
            </PrivateRoute>
          }
        />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
