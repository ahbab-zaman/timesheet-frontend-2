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
  // Manager Routes
  {
    path: "/client",
    element: (
      <ProtectedRoute>
        <App />
      </ProtectedRoute>
    ),
    children: [{ path: "dashboard", element: <ManagerDashboard /> }],
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
