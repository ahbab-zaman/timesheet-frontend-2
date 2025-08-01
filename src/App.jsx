import React from "react";
import { Button } from "./components/ui/button";
import Login from "./pages/ LogIn/Login";
import AdminDashboard from "./pages/admin/adminDashboard";
import EmployeeManagement from "./pages/Employee/EmployeeManagement";

const App = () => {
  return (
    <div>
      {/* <Button>Mo</Button> */}
      {/* <Login /> */}
      {/* <AdminDashboard /> */}
      <EmployeeManagement />
    </div>
  );
};

export default App;
