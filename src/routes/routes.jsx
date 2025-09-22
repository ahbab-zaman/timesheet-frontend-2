import { createBrowserRouter } from "react-router-dom";
import Login from "@/pages/login/Login";
import App from "@/App";
import ManagerDashboard from "@/pages/manager/ManagerDashboard";
import EmployeeDashboard from "@/pages/employee/EmployeeDashboard";
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import PublicRoute from "../utils/RedirectToDashboard";
import RedirectToDashboard from "../utils/RedirectToDashboard";
import EmployeeMain from "@/pages/employee/EmployeeMain";

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
        <App />
      </ProtectedRoute>
    ),
    children: [{ path: "dashboard", element: <EmployeeMain /> }],
  },
  {
    path: "/freelancer/timesheet",
    element: <EmployeeDashboard />,
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
