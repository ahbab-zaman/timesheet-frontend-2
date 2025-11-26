import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

import { logout } from "@/redux/features/auth/authSlice";
import {
  LogOut,
  Settings,
  User,
  X,
  Menu,
  CreditCard,
  CalendarCheck,
  Clock1,
} from "lucide-react";
import { useDispatch } from "react-redux";
import { Link, Outlet } from "react-router-dom";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import axiosInstance from "../../services/axiosInstance";
import TimeTracker from "./TimeTracker";

const EmployeeNav = () => {
  const dispatch = useDispatch();
  const [showTimeTracker, setShowTimeTracker] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState({});
  const [refreshKey, setRefreshKey] = useState(0);
  const [openLogoutDialog, setOpenLogoutDialog] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    toast.success("Logout successful.");
  };

  useEffect(() => {
    const fetchCurrentEmployee = async () => {
      try {
        const response = await axiosInstance.get("/api/v1/employee/me");
        setCurrentEmployee(response.data.employee);
      } catch (error) {
        console.error("Failed to fetch employee:", error);
      }
    };
    fetchCurrentEmployee();
  }, []);

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const getInitials = (name) => {
    if (!name) return "";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6 bg-white p-4 rounded-lg shadow-md">
        <div className="flex items-center gap-3">
          <div>
            <Button
              variant="outline"
              className="p-2"
              onClick={() => setShowSidebar(!showSidebar)}
            >
              <Menu className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center space-x-4">
            <Avatar className="border-2 border-blue-500">
              <AvatarImage
                src="/placeholder-avatar.jpg"
                alt="Employee User"
                className="rounded-full"
              />
              <AvatarFallback className="bg-blue-100 text-blue-800">
                {getInitials(currentEmployee.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                {currentEmployee.name}
              </h2>
              <p className="text-md text-gray-600 font-medium">
                {currentEmployee.position}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Link to={"/freelancer/dashboard"}>
            <Button variant="outline" className="flex items-center gap-2">
              Dashboard
            </Button>
          </Link>

          {/* Time Tracker Button */}
          <div>
            <button
              onClick={() => setShowTimeTracker(true)}
              className="relative flex justify-center items-center w-10 h-10 rounded-full bg-black hover:bg-gray-900 transition shadow-[0_0_12px_rgba(0,0,0,0.4)]"
            >
              <span className="absolute inset-0 rounded-full border border-white/40 opacity-40 animate-ring"></span>
              <svg
                stroke="currentColor"
                fill="white"
                strokeWidth="0"
                viewBox="0 0 512 512"
                className="w-6 h-6 relative z-10"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M188.3 147.1c-7.6 4.2-12.3 12.3-12.3 20.9v176c0 8.7 4.7 16.7 12.3 20.9s16.8 4.1 24.3-.5l144-88c7.1-4.4 11.5-12.1 11.5-20.5s-4.4-16.1-11.5-20.5l-144-88c-7.4-4.5-16.7-4.7-24.3-.5z"></path>
              </svg>
            </button>
          </div>

          {/* User Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>User</span>
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />

              <DropdownMenuItem asChild>
                <Link
                  to="/freelancer/settings"
                  className="flex items-center gap-2 w-full"
                >
                  <Settings className="h-4 w-4" />
                  <span>Account Settings</span>
                </Link>
              </DropdownMenuItem>

              {/* Logout with Confirmation Dialog */}
              <DropdownMenuItem
                onSelect={(e) => e.preventDefault()}
                className="cursor-pointer"
              >
                <AlertDialog
                  open={openLogoutDialog}
                  onOpenChange={setOpenLogoutDialog}
                >
                  <AlertDialogTrigger asChild>
                    <div className="flex items-center gap-2 w-full cursor-pointer">
                      <LogOut className="h-4 w-4" />
                      <span>Logout</span>
                    </div>
                  </AlertDialogTrigger>

                  <AlertDialogContent className="rounded-xl shadow-2xl border border-gray-200">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-xl font-semibold">
                        Confirm Logout
                      </AlertDialogTitle>
                      <AlertDialogDescription className="text-md text-gray-600">
                        Are you sure you want to logout? You will need to login
                        again to access your dashboard.
                      </AlertDialogDescription>
                    </AlertDialogHeader>

                    <AlertDialogFooter>
                      <AlertDialogCancel className="rounded-md">
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-red-600 hover:bg-red-700 text-white rounded-md"
                        onClick={handleLogout}
                      >
                        Yes, Logout
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </DropdownMenuItem>

              <DropdownMenuSeparator />
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Backdrop for TimeTracker */}
      {showTimeTracker && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setShowTimeTracker(false)}
        />
      )}

      {/* Backdrop for Sidebar */}
      {showSidebar && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setShowSidebar(false)}
        />
      )}

      {/* Time Tracker Panel */}
      <div
        className={`fixed right-0 top-0 h-full w-80 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-50 ${
          showTimeTracker ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-semibold">Time Tracker</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowTimeTracker(false)}
            className="p-1"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        <div className="p-4 overflow-y-auto h-[calc(100%-64px)]">
          <TimeTracker
            refreshTimeEntries={handleRefresh}
            currentEmployee={currentEmployee}
            refreshTimesheets={handleRefresh}
          />
        </div>
      </div>

      {/* Navigation Sidebar */}
      <div
        className={`fixed left-0 top-0 h-full w-64 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-50 ${
          showSidebar ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-semibold">Menu</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSidebar(false)}
            className="p-1"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        <div className="p-4 space-y-2">
          <Link
            to="/freelancer/timesheet"
            className="flex items-center gap-2 p-2 rounded-md hover:bg-muted cursor-pointer w-full"
            onClick={() => setShowSidebar(false)}
          >
            <Clock1 className="h-4 w-4" />
            <span>Timesheet</span>
          </Link>
          <Link
            to="/freelancer/taskList"
            className="flex items-center gap-2 p-2 rounded-md hover:bg-muted cursor-pointer w-full"
            onClick={() => setShowSidebar(false)}
          >
            <CalendarCheck className="h-4 w-4" />
            <span>Task</span>
          </Link>
          <Link
            to="/freelancer/leave"
            className="flex items-center gap-2 p-2 rounded-md hover:bg-muted cursor-pointer w-full"
            onClick={() => setShowSidebar(false)}
          >
            <CalendarCheck className="h-4 w-4" />
            <span>Leave & Holiday</span>
          </Link>
        </div>
      </div>

      <Outlet key={refreshKey} />
    </div>
  );
};

export default EmployeeNav;
