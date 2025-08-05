import React from "react";
import { Button } from "./components/ui/button";
import Login from "./pages/login/Login";
import AdminDashboard from "./pages/admin/AdminDashboard";
import EmployeeManagement from "./pages/admin/EmployeeManagement";
import MainLayout from "./components/layout/MainLayout";
import EmployeeDashboard from "./pages/employee/EmployeeDashboard";
import { Toaster } from "sonner";
import ManagerDashboard from "./pages/manager/ManagerDashboard";
import FinanceDashboard from "./pages/finance/FinanceDashboard";

const App = () => {
  return (
    <div>
      {/* <Button>Mo</Button> */}
      {/* <Login /> */}
      {/* <AdminDashboard /> */}
      {/* <EmployeeManagement /> */}
      {/* <h1>Timesheet Project</h1> */}
      {/* <MainLayout/> */}
      {/* <EmployeeDashboard /> */}
      {/* <ManagerDashboard />*/}
      <FinanceDashboard />
      <Toaster position="bottom-right" />
    </div>
  );
};

export default App;
