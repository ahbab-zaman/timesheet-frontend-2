import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Users,
  Clock,
  LogOut,
  CheckCircle,
  XCircle,
  Filter,
  MessageSquare,
  Settings,
  Plus,
  Calendar,
  Search,
  ChevronDown,
  ChevronRight,
  CalendarDays,
  Bell,
} from "lucide-react";
import {
  format,
  startOfWeek,
  endOfWeek,
  addDays,
  subDays,
  startOfMonth,
  endOfMonth,
} from "date-fns";
import TaskManagement from "./TaskManagement";
import { useDispatch } from "react-redux";
import { logout } from "@/redux/features/auth/authSlice";
import toast from "react-hot-toast";
import { NavLink } from "react-router-dom";
import LeaveRequest from "./LeaveRequest";
import NotificationSystem from "./NotificationSystem";

const AdminDashboard = () => {
  const [timesheets, setTimesheets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTimesheet, setSelectedTimesheet] = useState(null);
  const [rejectionComment, setRejectionComment] = useState("");
  const [filter, setFilter] = useState("submitted");
  const [userRole, setUserRole] = useState(null);
  const [activeTab, setActiveTab] = useState("timesheets");
  const [employeeSearchTerm, setEmployeeSearchTerm] = useState("");
  const [expandedTimesheets, setExpandedTimesheets] = useState({});
  const [dateRange, setDateRange] = useState({
    start: startOfWeek(new Date(), { weekStartsOn: 1 }),
    end: endOfWeek(new Date(), { weekStartsOn: 1 }),
  });
  const [quickFilter, setQuickFilter] = useState("this-week");
  const dispatch = useDispatch();

  useEffect(() => {
    // Simulate auth check
    const user = { id: "user1" }; // Mock user
    if (!user) {
      return;
    }

    // Simulate checking manager role
    const checkManagerRole = async () => {
      try {
        const role = "manager"; // or 'admin'
        if (role !== "manager" && role !== "admin") {
          return;
        }
        setUserRole(role);
        setLoading(false);
      } catch (error) {
        // navigate("/attendance-timesheet");
      }
    };

    checkManagerRole();
  }, []);

  const handleQuickFilter = (value) => {
    setQuickFilter(value);
    const now = new Date();
    switch (value) {
      case "this-week":
        setDateRange({
          start: startOfWeek(now, { weekStartsOn: 1 }),
          end: endOfWeek(now, { weekStartsOn: 1 }),
        });
        break;
      case "last-week":
        setDateRange({
          start: startOfWeek(subDays(now, 7), { weekStartsOn: 1 }),
          end: endOfWeek(subDays(now, 7), { weekStartsOn: 1 }),
        });
        break;
      case "last-30-days":
        setDateRange({
          start: subDays(now, 30),
          end: now,
        });
        break;
      case "this-month":
        setDateRange({
          start: startOfMonth(now),
          end: endOfMonth(now),
        });
        break;
      default:
        break;
    }
  };

  const handleApprove = (timesheetId) => {
    setTimesheets((prev) =>
      prev.map((t) =>
        t.id === timesheetId
          ? { ...t, status: "approved", approved_at: new Date().toISOString() }
          : t
      )
    );
    alert("Timesheet approved! ✅");
  };

  const handleReject = (timesheetId) => {
    if (!rejectionComment.trim()) return;
    setTimesheets((prev) =>
      prev.map((t) =>
        t.id === timesheetId
          ? { ...t, status: "rejected", comments: rejectionComment }
          : t
      )
    );
    alert("Timesheet rejected");
    setRejectionComment("");
    setSelectedTimesheet(null);
  };

  const getStatusBadge = (status) => {
    const variants = {
      submitted: { variant: "secondary", label: "🟡 Pending" },
      approved: { variant: "default", label: "✅ Approved" },
      rejected: { variant: "destructive", label: "🔴 Rejected" },
      draft: { variant: "outline", label: "Draft" },
    };
    const config = variants[status] || variants.draft;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const toggleTimesheet = (timesheetId) => {
    setExpandedTimesheets((prev) => ({
      ...prev,
      [timesheetId]: !prev[timesheetId],
    }));
  };

  const handleLogout = () => {
    dispatch(logout());
    toast.success("Logout successful.");
  };

  // Custom message based on filter
  const getNoDataMessage = () => {
    switch (filter) {
      case "submitted":
        return "No pending timesheets found";
      case "approved":
        return "No approved timesheets found";
      case "rejected":
        return "No rejected timesheets found";
      case "all":
        return "No timesheets found";
      default:
        return "No timesheets found";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Clock className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading timesheets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-100">
      <div className="w-full mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <div className="bg-black rounded-full p-2">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Admin Dashboard</h1>
              <p className="text-gray-500">
                Admin's review helps keep project hours aligned ✅
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <NotificationSystem />
            <NavLink to="/admin/dashboard/employee-management">
              <Button variant="outline" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Employee Management
              </Button>
            </NavLink>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex gap-4 items-center">
            <div className="flex gap-2">
              <Button
                variant={activeTab === "timesheets" ? "default" : "outline"}
                onClick={() => setActiveTab("timesheets")}
              >
                <Clock className="h-4 w-4 mr-2" />
                Timesheets
              </Button>
              <Button
                variant={activeTab === "tasks" ? "default" : "outline"}
                onClick={() => setActiveTab("tasks")}
              >
                <Plus className="h-4 w-4 mr-2" />
                Task Management
              </Button>
              <Button
                variant={activeTab === "leaves" ? "default" : "outline"}
                onClick={() => setActiveTab("leaves")}
              >
                <Calendar className="h-4 w-4 mr-2" />
                Leave Requests
              </Button>
            </div>

            {activeTab === "timesheets" && (
              <>
                <div className="flex gap-2">
                  <Button
                    variant={filter === "submitted" ? "default" : "outline"}
                    onClick={() => setFilter("submitted")}
                    size="sm"
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    Pending (
                    {timesheets.filter((t) => t.status === "submitted").length})
                  </Button>
                  <Button
                    variant={filter === "approved" ? "default" : "outline"}
                    onClick={() => setFilter("approved")}
                    size="sm"
                  >
                    Approved
                  </Button>
                  <Button
                    variant={filter === "rejected" ? "default" : "outline"}
                    onClick={() => setFilter("rejected")}
                    size="sm"
                  >
                    Rejected
                  </Button>
                  <Button
                    variant={filter === "all" ? "default" : "outline"}
                    onClick={() => setFilter("all")}
                    size="sm"
                  >
                    All
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-gray-500" />
                  <Select value={quickFilter} onValueChange={handleQuickFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="this-week">This Week</SelectItem>
                      <SelectItem value="last-week">Last Week</SelectItem>
                      <SelectItem value="this-month">This Month</SelectItem>
                      <SelectItem value="last-30-days">Last 30 Days</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {format(dateRange.start, "MMM dd")} -{" "}
                    {format(dateRange.end, "MMM dd, yyyy")}
                  </div>
                </div>
              </>
            )}
          </div>
          {activeTab === "timesheets" && (
            <div className="p-4">
              <div className="flex justify-center items-center gap-2">
                <Search className="h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search by employee name..."
                  value={employeeSearchTerm}
                  onChange={(e) => setEmployeeSearchTerm(e.target.value)}
                  className="w-64"
                />
                {employeeSearchTerm && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEmployeeSearchTerm("")}
                    className="text-xs"
                  >
                    Clear
                  </Button>
                )}
              </div>

              {/* No Data Message */}
              {timesheets.length === 0 && (
                <div>
                  <Card className="flex flex-col items-center justify-center p-12 text-center border mt-4">
                    <Clock className="h-12 w-12 mb-4 text-gray-400" />
                    <CardContent className="text-center">
                      <h2 className="text-lg font-semibold">
                        {getNoDataMessage()}
                      </h2>
                      <p className="text-sm">
                        {filter === "submitted"
                          ? "No pending timesheets to review."
                          : filter === "approved"
                          ? "No approved timesheets available."
                          : filter === "rejected"
                          ? "No rejected timesheets available."
                          : "No timesheets available."}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          )}
        </div>

        {activeTab === "tasks" && (
          <div>
            <TaskManagement />
          </div>
        )}
        {activeTab === "leaves" && (
          <div>
            <LeaveRequest />
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
