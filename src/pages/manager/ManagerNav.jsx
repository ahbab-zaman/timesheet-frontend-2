import { Button } from "@/components/ui/button";
import NotificationSystem from "../manager/Notification";
import {
  LogOut,
  Settings,
  Users,
  Menu,
  X,
  LayoutDashboard,
  ClipboardCheck,
  Clock,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
  AlertDialogTitle,
  AlertDialogDescription,
} from "@/components/ui/alert-dialog";

import { Outlet, NavLink, Link } from "react-router-dom";
import { logout } from "@/redux/features/auth/authSlice";
import { useDispatch } from "react-redux";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import axiosInstance from "@/services/axiosInstance";

const ManagerNav = () => {
  const dispatch = useDispatch();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState(null);
  const [isTimesheetDropdownOpen, setIsTimesheetDropdownOpen] = useState(false);
  const [isManagerViewDropdownOpen, setIsManagerViewDropdownOpen] =
    useState(false);

  // 🔥 NEW: Logout confirmation dialog state
  const [openLogoutDialog, setOpenLogoutDialog] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    toast.success("Logout successful.");
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleTimesheetDropdown = () => {
    setIsTimesheetDropdownOpen(!isTimesheetDropdownOpen);
  };

  const toggleManagerViewDropdown = () => {
    setIsManagerViewDropdownOpen(!isManagerViewDropdownOpen);
  };

  useEffect(() => {
    const fetchCurrentManager = async () => {
      try {
        const response = await axiosInstance.get("/api/v1/auth/manager");
        setCurrentEmployee(response.data.user);
      } catch (error) {
        console.error("Failed to fetch employee:", error);
      }
    };
    fetchCurrentManager();
  }, []);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out`}
      >
        <div className="flex items-center justify-end p-4 border-b">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSidebar}
            className="border"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Nav Links */}
        <nav className="mt-4 px-4 space-y-2">
          {/* Timesheets Dropdown */}
          <div>
            <button
              onClick={toggleTimesheetDropdown}
              className="flex items-center justify-between w-full px-3 py-2 text-gray-700 rounded-md hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center">
                <Clock size={18} className="mr-3" />
                <span>Timesheets</span>
              </div>
              {isTimesheetDropdownOpen ? (
                <ChevronDown size={16} />
              ) : (
                <ChevronRight size={16} />
              )}
            </button>

            {isTimesheetDropdownOpen && (
              <div className="ml-6 mt-1 space-y-1">
                <NavLink
                  to="/client/timesheets"
                  className={({ isActive }) =>
                    `flex items-center px-3 py-2 text-gray-600 text-sm rounded-md hover:bg-gray-100 ${
                      isActive ? "bg-gray-100 text-gray-900 font-medium" : ""
                    }`
                  }
                  onClick={toggleSidebar}
                >
                  Timesheet Management
                </NavLink>

                <NavLink
                  to="/client/timesheets-view"
                  className={({ isActive }) =>
                    `flex items-center px-3 py-2 text-gray-600 text-sm rounded-md hover:bg-gray-100 ${
                      isActive ? "bg-gray-100 text-gray-900 font-medium" : ""
                    }`
                  }
                  onClick={toggleSidebar}
                >
                  Timesheet View
                </NavLink>
              </div>
            )}
          </div>

          {/* Manager Tasks */}
          <NavLink
            to="/client/tasks"
            className={({ isActive }) =>
              `flex items-center px-3 py-2 text-gray-700 rounded-md hover:bg-gray-100 transition-colors ${
                isActive ? "bg-gray-100 isActive" : ""
              }`
            }
            onClick={toggleSidebar}
          >
            <ClipboardCheck size={18} className="mr-3" />
            Manager Tasks
          </NavLink>

          {/* Manager View Dropdown */}
          <div>
            <button
              onClick={toggleManagerViewDropdown}
              className="flex items-center justify-between w-full px-3 py-2 text-gray-700 rounded-md hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center">
                <span className="mr-3">👁️</span>
                <span>Manager View</span>
              </div>
              {isManagerViewDropdownOpen ? (
                <ChevronDown size={16} />
              ) : (
                <ChevronRight size={16} />
              )}
            </button>

            {isManagerViewDropdownOpen && (
              <div className="ml-6 mt-1 space-y-1">
                <NavLink
                  to="/client/timesheets-projects"
                  className={({ isActive }) =>
                    `flex items-center px-3 py-2 text-gray-600 text-sm rounded-md hover:bg-gray-100 ${
                      isActive ? "bg-gray-100 text-gray-900 font-medium" : ""
                    }`
                  }
                  onClick={toggleSidebar}
                >
                  📋 Timesheets by Project
                </NavLink>

                <NavLink
                  to="/client/productivity"
                  className={({ isActive }) =>
                    `flex items-center px-3 py-2 text-gray-600 text-sm rounded-md hover:bg-gray-100 ${
                      isActive ? "bg-gray-100 text-gray-900 font-medium" : ""
                    }`
                  }
                  onClick={toggleSidebar}
                >
                  📊 Team Productivity
                </NavLink>

                <NavLink
                  to="/client/project-overview"
                  className={({ isActive }) =>
                    `flex items-center px-3 py-2 text-gray-600 text-sm rounded-md hover:bg-gray-100 ${
                      isActive ? "bg-gray-100 text-gray-900 font-medium" : ""
                    }`
                  }
                  onClick={toggleSidebar}
                >
                  🎯 Project Overview
                </NavLink>

                <NavLink
                  to="/client/personalization"
                  className={({ isActive }) =>
                    `flex items-center px-3 py-2 text-gray-600 text-sm rounded-md hover:bg-gray-100 ${
                      isActive ? "bg-gray-100 text-gray-900 font-medium" : ""
                    }`
                  }
                  onClick={toggleSidebar}
                >
                  ⚙️ Role Customization
                </NavLink>
              </div>
            )}
          </div>

          {/* Leave & Holidays */}
          <NavLink
            to="/client/leave-holidays"
            className={({ isActive }) =>
              `flex items-center px-3 py-2 text-gray-700 rounded-md hover:bg-gray-100 transition-colors ${
                isActive ? "bg-gray-100 isActive" : ""
              }`
            }
            onClick={toggleSidebar}
          >
            <span className="mr-3">📅</span>
            Leave and Holidays
          </NavLink>
        </nav>
      </div>

      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50"
          onClick={toggleSidebar}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b shadow-sm p-4 flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={toggleSidebar}>
              <Menu className="h-10 w-10" />
            </Button>

            <div className={`${isSidebarOpen ? "hidden" : ""}`}>
              {currentEmployee && (
                <>
                  <p className="text-slate-900 text-2xl font-bold">
                    Welcome, {currentEmployee?.fullName}
                  </p>
                  <p className="text-gray-600 text-lg font-medium">
                    Role: {currentEmployee?.roles?.[0]?.role || "Client"}
                  </p>
                </>
              )}
              <p className="text-gray-600 text-sm">
                Manager's review helps keep project hours aligned ✅
              </p>
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-2">
            <NotificationSystem />

            <Link to="/client/dashboard">
              <Button variant="outline" className="hidden sm:flex text-sm">
                Dashboard
              </Button>
            </Link>

            {/* 🔥 Logout with Confirmation */}
            <AlertDialog
              open={openLogoutDialog}
              onOpenChange={setOpenLogoutDialog}
            >
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="text-sm">
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </AlertDialogTrigger>

              <AlertDialogContent className="rounded-xl shadow-2xl border p-6">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-xl font-semibold">
                    Confirm Logout
                  </AlertDialogTitle>
                  <AlertDialogDescription className="text-gray-600 text-md">
                    Are you sure you want to sign out? Your session will end.
                  </AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter>
                  <AlertDialogCancel className="rounded-md">
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleLogout}
                    className="bg-red-600 hover:bg-red-700 text-white rounded-md"
                  >
                    Yes, Sign Out
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </header>

        {/* Routed Pages */}
        <main className="flex-1 overflow-y-auto p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default ManagerNav;
