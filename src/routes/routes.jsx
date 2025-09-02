import { createBrowserRouter } from "react-router-dom";
import Login from "@/pages/login/Login";
import App from "@/App";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import EmployeeManagement from "@/pages/admin/EmployeeManagement";
import ManagerDashboard from "@/pages/manager/ManagerDashboard";
import EmployeeDashboard from "@/pages/employee/EmployeeDashboard";
import FinanceDashboard from "@/pages/finance/FinanceDashboard";
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import PublicRoute from "../utils/RedirectToDashboard";
import RedirectToDashboard from "../utils/RedirectToDashboard";
import EmployeeMain from "@/pages/employee/EmployeeMain";

const router = createBrowserRouter([
  // Root → redirect based on role if logged in
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <RedirectToDashboard />
      </ProtectedRoute>
    ),
  },

  // Admin Routes
  {
    path: "/admin",
    element: (
      <ProtectedRoute>
        <App />
      </ProtectedRoute>
    ),
    children: [
      { path: "dashboard", element: <AdminDashboard /> },
      {
        path: "dashboard/employee-management",
        element: <EmployeeManagement />,
      },
    ],
  },

  // Manager Routes
  {
    path: "/manager",
    element: (
      <ProtectedRoute>
        <App />
      </ProtectedRoute>
    ),
    children: [{ path: "dashboard", element: <ManagerDashboard /> }],
  },

  // Employee Routes
  {
    path: "/employee",
    element: (
      <ProtectedRoute>
        <App />
      </ProtectedRoute>
    ),
    children: [{ path: "dashboard", element: <EmployeeMain /> }],
  },
  {
    path: "/employee/timesheet",
    element: <EmployeeDashboard />,
  },
  // Finance Routes
  {
    path: "/finance",
    element: (
      <ProtectedRoute>
        <App />
      </ProtectedRoute>
    ),
    children: [{ path: "dashboard", element: <FinanceDashboard /> }],
  },

  // Login → Public only
  {
    path: "/login",
    element: (
      <PublicRoute>
        <Login />
      </PublicRoute>
    ),
  },
]);

export default router;
