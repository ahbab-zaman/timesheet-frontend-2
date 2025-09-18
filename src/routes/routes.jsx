// import { createBrowserRouter } from "react-router-dom";
// import Login from "@/pages/login/Login";
// import App from "@/App";
// import AdminDashboard from "@/pages/admin/AdminDashboard";
// import EmployeeManagement from "@/pages/admin/EmployeeManagement";
// import ManagerDashboard from "@/pages/manager/ManagerDashboard";
// import EmployeeDashboard from "@/pages/employee/EmployeeDashboard";
// import FinanceDashboard from "@/pages/finance/FinanceDashboard";
// import ProtectedRoute from "@/components/layout/ProtectedRoute";
// import PublicRoute from "../utils/RedirectToDashboard";
// import RedirectToDashboard from "../utils/RedirectToDashboard";
// import EmployeeMain from "@/pages/employee/EmployeeMain";

// const router = createBrowserRouter([
//   // Root → redirect based on role if logged in
//   {
//     path: "/home",
//     element: (
//       <ProtectedRoute>
//         <RedirectToDashboard />
//       </ProtectedRoute>
//     ),
//   },

//   // Admin Routes
//   {
//     path: "/admin",
//     element: (
//       <ProtectedRoute>
//         <App />
//       </ProtectedRoute>
//     ),
//     children: [
//       { path: "dashboard", element: <AdminDashboard /> },
//       {
//         path: "dashboard/employee-management",
//         element: <EmployeeManagement />,
//       },
//     ],
//   },

//   // Manager Routes
//   {
//     path: "/manager",
//     element: (
//       <ProtectedRoute>
//         <App />
//       </ProtectedRoute>
//     ),
//     children: [{ path: "dashboard", element: <ManagerDashboard /> }],
//   },

//   // Employee Routes
//   {
//     path: "/employee",
//     element: (
//       <ProtectedRoute>
//         <App />
//       </ProtectedRoute>
//     ),
//     children: [{ path: "dashboard", element: <EmployeeMain /> }],
//   },
//   {
//     path: "/employee/timesheet",
//     element: <EmployeeDashboard />,
//   },
//   // Finance Routes
//   {
//     path: "/finance",
//     element: (
//       <ProtectedRoute>
//         <App />
//       </ProtectedRoute>
//     ),
//     children: [{ path: "dashboard", element: <FinanceDashboard /> }],
//   },

//   // Login → Public only
//   {
//     path: "/",
//     element: (
//       <PublicRoute>
//         <Login />
//       </PublicRoute>
//     ),
//   },
// ]);

// export default router;

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
