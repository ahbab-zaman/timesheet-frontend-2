import { createBrowserRouter } from "react-router-dom";
import Login from "@/pages/login/Login";
import App from "@/App";
import ManagerDashboard from "@/pages/manager/ManagerDashboard";
import EmployeeDashboard from "@/pages/employee/EmployeeDashboard";
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import PublicRoute from "../utils/RedirectToDashboard";
import RedirectToDashboard from "../utils/RedirectToDashboard";
import EmployeeMain from "@/pages/employee/EmployeeMain";
import EmployeeNav from "@/pages/employee/EmployeeNav";
import EmployeeTask from "@/components/EmployeeTask";
import EmployeeSettings from "@/pages/employee/EmployeeSetting";
import EmployeeLeave from "@/pages/employee/EmployeeLeave";
import ManagerNav from "@/pages/manager/ManagerNav";
import ManagerTimesheets from "@/pages/manager/ManagerTimesheets";
import TimesheetsView from "@/pages/manager/TimesheetView";
import ManagerTask from "@/pages/manager/ManagerTaskManagement";
import ManagerLeave from "@/pages/manager/ManagerLeave";
import TimesheetsTab from "@/pages/manager/TimesheetsTab";
import ProductivityTab from "@/pages/manager/ProductivityTab";
import ManagerProjectsTab from "@/pages/manager/ManagerProjectsTab";
import PersonalizationTab from "@/pages/manager/PersonalizationTab";

const router = createBrowserRouter([
  // Root → redirect based on role if logged in
  {
    path: "/home",
    element: (
      <ProtectedRoute>
        <RedirectToDashboard />
      </ProtectedRoute>
    ),
  },
  // Client Routes
  {
    path: "/client",
    element: (
      <ProtectedRoute>
        <ManagerNav />
      </ProtectedRoute>
    ),
    children: [
      { path: "dashboard", element: <ManagerDashboard /> },
      { path: "timesheets", element: <ManagerTimesheets /> },
      { path: "timesheets-view", element: <TimesheetsView /> },
      { path: "tasks", element: <ManagerTask /> },
      { path: "leave-holidays", element: <ManagerLeave /> },
      { path: "timesheets-projects", element: <TimesheetsTab /> },
      { path: "productivity", element: <ProductivityTab /> },
      { path: "project-overview", element: <ManagerProjectsTab /> },
      { path: "personalization", element: <PersonalizationTab /> },
    ],
  },
  // Employee Routes
  {
    path: "/freelancer",
    element: (
      <ProtectedRoute>
        <EmployeeNav />
      </ProtectedRoute>
    ),
    children: [
      { path: "dashboard", element: <EmployeeMain /> },
      { path: "timesheet", element: <EmployeeDashboard /> },
      { path: "taskList", element: <EmployeeTask /> },
      { path: "settings", element: <EmployeeSettings /> },
      { path: "leave", element: <EmployeeLeave /> },
    ],
  },
  // Login → Public only
  {
    path: "/",
    element: (
      <PublicRoute>
        <Login />
      </PublicRoute>
    ),
  },
]);

export default router;
