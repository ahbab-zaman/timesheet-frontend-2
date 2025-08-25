import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Users,
  Clock,
  LogOut,
  CheckCircle,
  XCircle,
  Filter,
  Calendar,
  Search,
  ChevronDown,
  ChevronRight,
  CalendarDays,
  BarChart3,
  Plus,
  Settings,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import TaskManagement from "./ManagerTaskManagement";
import LeaveApproval from "./ManagerLeave";
import NotificationSystem from "./Notification";
import ManagerTimesheetView from "./ManagerView";
import { toast } from "sonner";
import { logout } from "@/redux/features/auth/authSlice";
import { useDispatch } from "react-redux";

const TimesheetGrid = ({ timesheet }) => {
  const weekStart = startOfWeek(new Date(timesheet.week_start_date), {
    weekStartsOn: 1,
  });
  const weekDates = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const entriesByTask = timesheet.time_entries.reduce((acc, entry) => {
    const taskKey = entry.tasks?.task_title || "No Task";
    if (!acc[taskKey]) {
      acc[taskKey] = {
        taskTitle: entry.tasks?.task_title || "No Task",
        projectName: entry.tasks?.projects?.name || "No Project",
        entries: {},
      };
    }
    acc[taskKey].entries[entry.date] = entry.hours;
    return acc;
  }, {});

  return (
    <div className="overflow-x-auto">
      <table className="w-full border border-gray-200 rounded-lg">
        <thead>
          <tr className="bg-gray-100">
            <th className="text-left p-3 font-medium border-r text-sm">
              Task Name
            </th>
            {weekDates.map((date) => (
              <th
                key={date.toISOString()}
                className="text-center p-3 font-medium border-r min-w-[80px]"
              >
                <div className="text-xs text-gray-500">
                  {format(date, "EEE")}
                </div>
                <div className="text-sm">{format(date, "dd")}</div>
              </th>
            ))}
            <th className="text-center p-3 font-medium">Total</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(entriesByTask).map(([taskKey, taskData]) => {
            const taskTotal = Object.values(taskData.entries).reduce(
              (sum, hours) => sum + (hours || 0),
              0
            );
            return (
              <tr key={taskKey} className="border-t">
                <td className="p-3 border-r">
                  <div className="font-medium text-sm">
                    {taskData.taskTitle}
                  </div>
                  <div className="text-xs text-gray-500">
                    {taskData.projectName}
                  </div>
                </td>
                {weekDates.map((date) => {
                  const dateStr = format(date, "yyyy-MM-dd");
                  const hours = taskData.entries[dateStr] || 0;
                  return (
                    <td
                      key={date.toISOString()}
                      className="text-center p-3 border-r"
                    >
                      <div
                        className={`text-sm font-medium ${
                          hours > 0 ? "text-blue-600" : "text-gray-500"
                        }`}
                      >
                        {hours > 0 ? `${hours}h` : "-"}
                      </div>
                    </td>
                  );
                })}
                <td className="text-center p-3 font-bold">{taskTotal}h</td>
              </tr>
            );
          })}
          <tr className="border-t bg-gray-50">
            <td className="p-3 border-r font-bold">Total Hours</td>
            {weekDates.map((date) => {
              const dateStr = format(date, "yyyy-MM-dd");
              const dayTotal = Object.values(entriesByTask).reduce(
                (sum, taskData) => sum + (taskData.entries[dateStr] || 0),
                0
              );
              return (
                <td
                  key={date.toISOString()}
                  className="text-center p-3 border-r font-bold"
                >
                  {dayTotal > 0 ? `${dayTotal}h` : "-"}
                </td>
              );
            })}
            <td className="text-center p-3 font-bold text-blue-600">
              {timesheet.total_hours}h
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

const ManagerDashboard = () => {
  const navigate = useNavigate();
  const [timesheets, setTimesheets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTimesheet, setSelectedTimesheet] = useState(null);
  const [rejectionComment, setRejectionComment] = useState("");
  const [filter, setFilter] = useState("submitted");
  const [userRole, setUserRole] = useState("manager");
  const [activeTab, setActiveTab] = useState("timesheets");
  const [employeeSearchTerm, setEmployeeSearchTerm] = useState("");
  const [expandedTimesheets, setExpandedTimesheets] = useState({});
  const [dateRange, setDateRange] = useState({
    start: startOfWeek(new Date(), { weekStartsOn: 1 }),
    end: endOfWeek(new Date(), { weekStartsOn: 1 }),
  });
  const [quickFilter, setQuickFilter] = useState("this-week");
  const [selectedPeriod, setSelectedPeriod] = useState("weekly");
  const [configOpen, setConfigOpen] = useState(false);
  const [defaultPeriod, setDefaultPeriod] = useState("weekly");
  const [autoCreate, setAutoCreate] = useState(true);
  const dispatch = useDispatch();
  const mockTimesheets = [
    {
      id: "1",
      employee_id: "emp1",
      week_start_date: "2025-08-18",
      week_end_date: "2025-08-24",
      total_hours: 40,
      status: "submitted",
      submitted_at: "2025-08-24T10:00:00Z",
      comments: "Regular work week",
      approval_stage: "pending",
      requires_revision: false,
      employees: { name: "John Doe", email: "john.doe@example.com" },
      time_entries: [
        {
          date: "2025-08-18",
          hours: 8,
          description: "Development",
          task_id: "task1",
          tasks: { task_title: "Feature X", projects: { name: "Project A" } },
        },
        {
          date: "2025-08-19",
          hours: 8,
          description: "Testing",
          task_id: "task2",
          tasks: { task_title: "Bug Fixes", projects: { name: "Project B" } },
        },
      ],
    },
    {
      id: "2",
      employee_id: "emp2",
      week_start_date: "2025-08-18",
      week_end_date: "2025-08-24",
      total_hours: 35,
      status: "approved",
      submitted_at: "2025-08-23T09:00:00Z",
      comments: "Partial week",
      approval_stage: "approved",
      requires_revision: false,
      employees: { name: "Jane Smith", email: "jane.smith@example.com" },
      time_entries: [
        {
          date: "2025-08-18",
          hours: 7,
          description: "Design",
          task_id: "task3",
          tasks: { task_title: "UI Design", projects: { name: "Project C" } },
        },
      ],
    },
  ];

  useEffect(() => {
    setTimeout(() => {
      setTimesheets(mockTimesheets);
      setLoading(false);
    }, 1000);
  }, [filter, dateRange]);

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
  };

  const handleReject = (timesheetId) => {
    setTimesheets((prev) =>
      prev.map((t) =>
        t.id === timesheetId
          ? { ...t, status: "rejected", comments: rejectionComment }
          : t
      )
    );
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

  const handleSaveConfiguration = () => {
    setSelectedPeriod(defaultPeriod);
    setConfigOpen(false);
  };
  const handleLogout = () => {
    dispatch(logout());
    toast.success("Logout successful.");
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
      <div className="mx-auto p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8">
          <div className="flex items-center gap-3 mb-4 sm:mb-0">
            <div className="bg-blue-600 rounded-full p-2">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold">
                {userRole === "admin" ? "Admin Dashboard" : "Manager Dashboard"}
              </h1>
              <p className="text-gray-600 text-sm">
                Manager's review helps keep project hours aligned ✅
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <NotificationSystem />
            {userRole === "admin" && (
              <Button
                variant="outline"
                onClick={() => navigate("/employee-management")}
                className="flex items-center gap-2 text-sm"
              >
                <Settings className="h-4 w-4" />
                Employee Management
              </Button>
            )}
            <Button
              variant="outline"
              onClick={handleLogout}
              className="text-sm"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center flex-wrap">
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={activeTab === "timesheets" ? "default" : "outline"}
                onClick={() => setActiveTab("timesheets")}
                className="text-sm"
              >
                <Clock className="h-4 w-4 mr-2" />
                Timesheets
              </Button>
              <Button
                variant={activeTab === "enhanced" ? "default" : "outline"}
                onClick={() => setActiveTab("enhanced")}
                className="text-sm"
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Enhanced Manager View
              </Button>
              <Button
                variant={activeTab === "tasks" ? "default" : "outline"}
                onClick={() => setActiveTab("tasks")}
                className="text-sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Task Management
              </Button>
              <Button
                variant={activeTab === "leaves" ? "default" : "outline"}
                onClick={() => setActiveTab("leaves")}
                className="text-sm"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Leave Requests
              </Button>
            </div>

            {activeTab === "timesheets" && (
              <>
                <div className="flex gap-2 flex-wrap">
                  <Button
                    variant={filter === "submitted" ? "default" : "outline"}
                    onClick={() => setFilter("submitted")}
                    size="sm"
                    className="text-sm"
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    Pending (
                    {timesheets.filter((t) => t.status === "submitted").length})
                  </Button>
                  <Button
                    variant={filter === "approved" ? "default" : "outline"}
                    onClick={() => setFilter("approved")}
                    size="sm"
                    className="text-sm"
                  >
                    Approved
                  </Button>
                  <Button
                    variant={filter === "rejected" ? "default" : "outline"}
                    onClick={() => setFilter("rejected")}
                    size="sm"
                    className="text-sm"
                  >
                    Rejected
                  </Button>
                  <Button
                    variant={filter === "all" ? "default" : "outline"}
                    onClick={() => setFilter("all")}
                    size="sm"
                    className="text-sm"
                  >
                    All
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-gray-500" />
                  <Select value={quickFilter} onValueChange={handleQuickFilter}>
                    <SelectTrigger className="w-40 text-sm">
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

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Search className="h-4 w-4 text-gray-500" />
                  <Input
                    placeholder="Search by employee name..."
                    value={employeeSearchTerm}
                    onChange={(e) => setEmployeeSearchTerm(e.target.value)}
                    className="w-full sm:w-64 text-sm"
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
                <div>
                  <Dialog open={configOpen} onOpenChange={setConfigOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline">
                        <Settings className="h-4 w-4 mr-2" />
                        Configure
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>
                          Timesheet Period Configuration
                        </DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Default Period Type
                          </label>
                          <Select
                            value={defaultPeriod}
                            onValueChange={setDefaultPeriod}
                          >
                            <SelectTrigger className="w-full mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="weekly">Weekly</SelectItem>
                              <SelectItem value="biweekly">Biweekly</SelectItem>
                              <SelectItem value="monthly">Monthly</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center justify-between">
                          <label className="block text-sm font-medium text-gray-700">
                            Auto-create Periods
                          </label>
                          <input
                            type="checkbox"
                            checked={autoCreate}
                            onChange={(e) => setAutoCreate(e.target.checked)}
                            className="ml-2 h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                        </div>
                        <div className="border-t pt-4">
                          <h3 className="text-sm font-medium text-gray-700">
                            🕒 Department Overview
                          </h3>
                          <div className="mt-2 space-y-2">
                            <p className="text-sm text-gray-600">
                              Department: All Departments
                            </p>
                            <p className="text-sm text-gray-600">
                              Default Period: {defaultPeriod}
                            </p>
                            <p className="text-sm text-gray-600">
                              Auto-create: {autoCreate ? "Enabled" : "Disabled"}
                            </p>
                          </div>
                        </div>
                        <Button
                          onClick={handleSaveConfiguration}
                          className="w-full bg-blue-600 text-white hover:bg-blue-700 mt-4"
                        >
                          Save Configuration
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </>
            )}
          </div>
        </div>

        {activeTab === "timesheets" ? (
          <div className="grid gap-4">
            {(() => {
              const filteredTimesheets = timesheets.filter(
                (timesheet) =>
                  timesheet.employees?.name
                    ?.toLowerCase()
                    .includes(employeeSearchTerm.toLowerCase()) ||
                  timesheet.employees?.email
                    ?.toLowerCase()
                    .includes(employeeSearchTerm.toLowerCase())
              );

              return filteredTimesheets.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <Clock className="h-12 w-12 mx-auto text-gray-500 mb-4" />
                    <h3 className="text-lg font-medium mb-2">
                      {employeeSearchTerm
                        ? "No matching timesheets found"
                        : "No timesheets found"}
                    </h3>
                    <p className="text-gray-600">
                      {employeeSearchTerm
                        ? `No timesheets found for "${employeeSearchTerm}"`
                        : filter === "submitted"
                        ? "No pending timesheets to review."
                        : `No ${filter} timesheets found.`}
                    </p>
                    {employeeSearchTerm && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEmployeeSearchTerm("")}
                        className="mt-2 text-sm"
                      >
                        Clear Search
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ) : (
                filteredTimesheets.map((timesheet) => {
                  const isExpanded = expandedTimesheets[timesheet.id];
                  return (
                    <Card key={timesheet.id} className="overflow-hidden">
                      <div
                        className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 cursor-pointer hover:bg-gray-50 transition-colors border-b"
                        onClick={() => toggleTimesheet(timesheet.id)}
                      >
                        <div className="flex items-center gap-3 mb-2 sm:mb-0">
                          <div className="flex items-center gap-2">
                            {isExpanded ? (
                              <ChevronDown className="h-4 w-4 text-gray-500" />
                            ) : (
                              <ChevronRight className="h-4 w-4 text-gray-500" />
                            )}
                            <div>
                              <div className="font-semibold text-sm">
                                {timesheet.employees.name}
                              </div>
                              <div className="text-xs text-gray-500">
                                {timesheet.employees.email}
                              </div>
                            </div>
                          </div>
                          <div className="hidden sm:block text-xs text-gray-500">
                            Week:{" "}
                            {format(
                              new Date(timesheet.week_start_date),
                              "MMM dd"
                            )}{" "}
                            -{" "}
                            {format(
                              new Date(timesheet.week_end_date),
                              "MMM dd, yyyy"
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          {getStatusBadge(timesheet.status)}
                          <div className="text-right">
                            <div className="text-lg font-bold">
                              {timesheet.total_hours}h
                            </div>
                            <div className="text-xs text-gray-500">
                              {format(
                                new Date(timesheet.submitted_at),
                                "MMM dd"
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {isExpanded && (
                        <CardContent className="p-0">
                          <div className="p-4 space-y-4">
                            {timesheet.time_entries.length > 0 && (
                              <div>
                                <h4 className="font-medium mb-4 text-sm">
                                  {timesheet.period_type
                                    ? `${
                                        timesheet.period_type
                                          .charAt(0)
                                          .toUpperCase() +
                                        timesheet.period_type.slice(1)
                                      } Timesheet Grid:`
                                    : "Weekly Timesheet Grid:"}
                                </h4>
                                <TimesheetGrid timesheet={timesheet} />
                              </div>
                            )}

                            {timesheet.comments && (
                              <div>
                                <h4 className="font-medium mb-2 text-sm">
                                  Comments:
                                </h4>
                                <p className="text-sm text-gray-600 bg-gray-100 p-3 rounded">
                                  {timesheet.comments}
                                </p>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      )}
                    </Card>
                  );
                })
              );
            })()}
          </div>
        ) : activeTab === "enhanced" ? (
          <ManagerTimesheetView />
        ) : activeTab === "tasks" ? (
          <TaskManagement />
        ) : (
          <LeaveApproval />
        )}
      </div>
    </div>
  );
};

export default ManagerDashboard;
