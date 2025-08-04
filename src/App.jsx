import React from "react";
import { Button } from "./components/ui/button";
import Login from "./pages/login/Login";
import AdminDashboard from "./pages/admin/AdminDashboard";
import EmployeeManagement from "./pages/admin/EmployeeManagement";
import MainLayout from "./components/layout/MainLayout";
import ProtectedRoute from "./components/layout/ProtectedRoute";

const App = () => {
  return (
    <div>
      {/* <Button>Mo</Button> */}
      {/* <Login /> */}
      {/* <AdminDashboard /> */}
      {/* <EmployeeManagement /> */}
      {/* <h1>Timesheet Project</h1> */}
    <ProtectedRoute>
       <MainLayout/>
    </ProtectedRoute>
    </div>
  );
};

export default App;
