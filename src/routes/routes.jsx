import About from "@/pages/About";
import { createBrowserRouter } from "react-router-dom";
import Login from "@/pages/login/Login";
import App from "@/App";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import EmployeeManagement from "@/pages/admin/EmployeeManagement";
import ManagerDashboard from "@/pages/manager/ManagerDashboard";
import EmployeeDashboard from "@/pages/employee/EmployeeDashboard";

const router = createBrowserRouter([
    {
        path: "/",
        element: <App />,
        children: [
            {   
                path: "about",
                element: <About />,
            }
        ]
    },
    {
        path: "/admin",
        element: <App />,
        children: [
            {   
                path: "dashboard",
                element: <AdminDashboard />,
            },
            {
                path: "employee-management",
                element: <EmployeeManagement />,
            }
        ]
    },
    {
        path: "/manager",
        element: <App />,
        children: [
            {   
                path: "dashboard",
                element: <ManagerDashboard />,
            },
        ]
    },
    {
        path: "/employee",
        element: <App />,
        children: [
            {   
                path: "dashboard",
                element: <EmployeeDashboard/>,
            },
        ]
    },
    {
        path: "/login",
        element: <Login/>
    }
])

export default router;

