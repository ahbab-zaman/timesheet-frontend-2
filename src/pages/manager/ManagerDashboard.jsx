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
  Filter,
  Calendar,
  Search,
  ChevronDown,
  ChevronRight,
  CalendarDays,
  BarChart3,
  Plus,
  Settings,
  ChevronLeft,
  CalendarIcon,
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
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Textarea } from "@/components/ui/textarea";
import TaskManagement from "./ManagerTaskManagement";
import LeaveApproval from "./ManagerLeave";
import NotificationSystem from "./Notification";
import ManagerTimesheetView from "./ManagerView";
import { toast } from "sonner";
import { logout } from "@/redux/features/auth/authSlice";
import { useDispatch } from "react-redux";
import axiosInstance from "../../services/axiosInstance";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { DialogTrigger } from "@radix-ui/react-dialog";

// Utility function to format time in hours, minutes, and seconds
const formatTime = (totalHours) => {
  const hours = Math.floor(totalHours);
  const minutes = Math.floor((totalHours - hours) * 60);
  const seconds = Math.floor(((totalHours - hours) * 60 - minutes) * 60);
  return { hours, minutes, seconds };
};

const WeeklyTimesheet = ({ timesheet }) => {
  const weekStart = startOfWeek(new Date(timesheet.week_start_date), {
    weekStartsOn: 1,
  });
  const weekDates = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const calculateDailyTotals = () => {
    const timeEntries = Array.isArray(timesheet.entries)
      ? timesheet.entries
      : [];

    const dailyTotals = new Array(7).fill(0);
    const dailyEntries = Array.from({ length: 7 }, () => []);

    timeEntries.forEach((entry) => {
      if (!entry?.date || !entry?.hours) return;

      const entryDate = new Date(entry.date).toISOString().slice(0, 10);
      const dayIndex = weekDates.findIndex(
        (date) => date.toISOString().slice(0, 10) === entryDate
      );

      if (dayIndex !== -1) {
        dailyTotals[dayIndex] += Number(entry.hours) || 0;
        dailyEntries[dayIndex].push(entry);
      }
    });

    return {
      dailyTotals: dailyTotals.map((hours) => Number(hours.toFixed(2))),
      dailyEntries,
    };
  };

  const { dailyTotals, dailyEntries } = calculateDailyTotals();
  const [isTimesheetOpen, setIsTimesheetOpen] = useState(false);

  return (
    <Card className="p-6 shadow-lg rounded-lg">
      <Collapsible open={isTimesheetOpen} onOpenChange={setIsTimesheetOpen}>
        <CollapsibleTrigger asChild>
          <div className="flex items-center justify-between mb-4 cursor-pointer">
            <h3 className="text-lg font-semibold text-gray-800">
              Weekly Timesheet
            </h3>
            <ChevronDown
              className={`h-5 w-5 text-gray-600 transition-transform duration-200 ${
                isTimesheetOpen ? "rotate-180" : "rotate-0"
              }`}
            />
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="space-y-6">
            {weekDates.map((date, index) => (
              <div
                key={date.toISOString()}
                className="border-b pb-4 last:border-b-0"
              >
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-semibold text-gray-800">
                    {format(date, "EEE")}
                  </h3>
                  <div className="text-sm font-medium text-blue-600 bg-blue-100 px-3 py-1 rounded-full flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>
                      Total: {formatTime(dailyTotals[index]).hours}h{" "}
                      {formatTime(dailyTotals[index]).minutes}m{" "}
                      {formatTime(dailyTotals[index]).seconds}s
                    </span>
                  </div>
                </div>
                {dailyEntries[index].length > 0 ? (
                  <div className="grid gap-3">
                    {dailyEntries[index].map((entry) => (
                      <div
                        key={entry.id}
                        className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-200"
                      >
                        <div className="flex items-center space-x-3">
                          <Clock className="h-5 w-5 text-blue-600" />
                          <div>
                            <div className="font-medium text-sm">
                              {entry.description || "No description"}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Project:{" "}
                              {entry.task?.project?.name || "No Project"} |
                              Task: {entry.task?.name || "No Task"}
                            </div>
                          </div>
                        </div>
                        <div className="text-sm font-medium text-gray-700">
                          {formatTime(entry.hours).hours}h{" "}
                          {formatTime(entry.hours).minutes}m{" "}
                          {formatTime(entry.hours).seconds}s
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-muted-foreground text-sm text-center py-2">
                    No time entries for this day
                  </div>
                )}
              </div>
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>
      <div className="grid grid-cols-8 font-medium border-t pt-2 bg-muted px-4 py-2 rounded-md mt-4">
        <div className="text-left">Total Hours</div>
        {weekDates.map((_, i) => (
          <div key={i} className="text-center">
            {formatTime(dailyTotals[i]).hours}h{" "}
            {formatTime(dailyTotals[i]).minutes}m{" "}
            {formatTime(dailyTotals[i]).seconds}s
          </div>
        ))}
      </div>
    </Card>
  );
};

const ManagerDashboard = ({ refreshTimesheetsCallback }) => {
  // Added prop
  const navigate = useNavigate();
  const [timesheets, setTimesheets] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [filter, setFilter] = useState("all");
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
  const [currentWeekStart, setCurrentWeekStart] = useState(
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );
  const dispatch = useDispatch();

  // Expose refresh function
  const refreshTimesheets = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get("/api/v1/time/timesheets/all", {
        params: {
          week_start: format(dateRange.start, "yyyy-MM-dd"),
          week_end: format(dateRange.end, "yyyy-MM-dd"),
          status: filter === "all" ? undefined : filter,
        },
      });

      const allTimesheets = Array.isArray(response.data)
        ? response.data.map((timesheet) => ({
            ...timesheet,
            employees: {
              id: timesheet.employee?.id || timesheet.employee_id || "Unknown",
              name: timesheet.employee?.name || "Unknown",
              email: timesheet.employee?.email || "Unknown",
            },
            entries: timesheet.entries || [],
          }))
        : [];

      setTimesheets(allTimesheets);
    } catch (error) {
      toast.error("Failed to fetch timesheets. Please try again.");
      console.error("Error fetching timesheets:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFilter = (value) => {
    setQuickFilter(value);
    const now = new Date();
    switch (value) {
      case "this-week":
        setDateRange({
          start: startOfWeek(now, { weekStartsOn: 1 }),
          end: endOfWeek(now, { weekStartsOn: 1 }),
        });
        setCurrentWeekStart(startOfWeek(now, { weekStartsOn: 1 }));
        break;
      case "last-week":
        setDateRange({
          start: startOfWeek(subDays(now, 7), { weekStartsOn: 1 }),
          end: endOfWeek(subDays(now, 7), { weekStartsOn: 1 }),
        });
        setCurrentWeekStart(startOfWeek(subDays(now, 7), { weekStartsOn: 1 }));
        break;
      case "last-30-days":
        setDateRange({
          start: subDays(now, 30),
          end: now,
        });
        setCurrentWeekStart(startOfWeek(subDays(now, 30), { weekStartsOn: 1 }));
        break;
      case "this-month":
        setDateRange({
          start: startOfMonth(now),
          end: endOfMonth(now),
        });
        setCurrentWeekStart(
          startOfWeek(startOfMonth(now), { weekStartsOn: 1 })
        );
        break;
    }
  };

  const handlePreviousWeek = () => {
    setCurrentWeekStart((prev) => addDays(prev, -7));
    setDateRange({
      start: addDays(dateRange.start, -7),
      end: addDays(dateRange.end, -7),
    });
  };

  const handleNextWeek = () => {
    setCurrentWeekStart((prev) => addDays(prev, 7));
    setDateRange({
      start: addDays(dateRange.start, 7),
      end: addDays(dateRange.end, 7),
    });
  };

  const handleDateSelect = (date) => {
    if (date) {
      const weekStart = startOfWeek(date, { weekStartsOn: 1 });
      setCurrentWeekStart(weekStart);
      setDateRange({
        start: weekStart,
        end: endOfWeek(weekStart, { weekStartsOn: 1 }),
      });
    }
  };

  const handleSubmitTimesheet = async (timesheetId) => {
    try {
      const timesheet = timesheets.find((t) => t.id === timesheetId);
      if (!timesheet || !timesheet.id) {
        toast.error("No timesheet found for submission.");
        return;
      }

      const response = await axiosInstance.patch(
        `/api/v1/time/timesheets/${timesheetId}/submit`
      );
      setTimesheets((prev) =>
        prev.map((t) =>
          t.id === timesheetId
            ? {
                ...t,
                status: "submitted",
                submitted_at: new Date().toISOString(),
              }
            : t
        )
      );
      toast.success("Timesheet submitted successfully!");
      await refreshTimesheets(); // Refresh after submission
    } catch (error) {
      toast.error("Failed to submit timesheet. Please try again.");
      console.error("Error submitting timesheet:", error);
    }
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

  useEffect(() => {
    let isMounted = true;

    const fetchCurrentUser = async () => {
      try {
        const response = await axiosInstance.get("/api/v1/employee");
        const user = response.data.employees[0];
        if (isMounted) {
          setUser(user.id);
        }
      } catch (error) {
        if (isMounted) {
          toast.error("Failed to fetch user data. Please try again.");
          console.error("Error fetching user data:", error);
        }
      }
    };

    const fetchEmployees = async () => {
      try {
        const response = await axiosInstance.get("/api/v1/employee", {
          params: { page: 1, limit: 1000 },
        });
        if (isMounted) {
          setEmployees(response.data.employees || []);
        }
      } catch (error) {
        if (isMounted) {
          toast.error("Failed to fetch employees. Please try again.");
          console.error("Error fetching employees:", error);
        }
      }
    };

    const initializeData = async () => {
      await fetchCurrentUser();
      await fetchEmployees();
      await refreshTimesheets(); // Use refreshTimesheets
    };

    initializeData();

    return () => {
      isMounted = false;
    };
  }, [filter, dateRange]);

  // Expose refreshTimesheets to parent via callback
  useEffect(() => {
    if (refreshTimesheetsCallback) {
      refreshTimesheetsCallback(refreshTimesheets);
    }
  }, [refreshTimesheetsCallback]);

  const weekDates = Array.from({ length: 7 }, (_, i) =>
    addDays(currentWeekStart, i)
  );

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
                {userRole === "admin" ? "Admin Dashboard" : "Client Dashboard"}
              </h1>
              <p className="text-gray-600 text-sm">
                Client's review helps keep project hours aligned ✅
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
                Enhanced Client View
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
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handlePreviousWeek}
                    className="text-sm"
                  >
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Previous Week
                  </Button>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-64 justify-start text-left text-sm"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {format(weekDates[0], "MMM dd")} -{" "}
                        {format(weekDates[6], "MMM dd, yyyy")}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={currentWeekStart}
                        onSelect={handleDateSelect}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleNextWeek}
                    className="text-sm"
                  >
                    Next Week
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
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
                      <Button variant="outline" className="text-sm">
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
                            <div className="text-lg font-bold bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-3 py-1 rounded-full inline-block">
                              {formatTime(timesheet.total_hours).hours}h{" "}
                              {formatTime(timesheet.total_hours).minutes}m{" "}
                              {formatTime(timesheet.total_hours).seconds}s
                            </div>
                            <div className="text-xs text-gray-500">
                              {format(
                                new Date(timesheet.submitted_at || new Date()),
                                "MMM dd"
                              )}
                            </div>
                          </div>
                          {timesheet.status === "draft" && (
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSubmitTimesheet(timesheet.id);
                              }}
                            >
                              Submit Timesheet
                            </Button>
                          )}
                        </div>
                      </div>

                      {isExpanded && (
                        <CardContent className="p-0">
                          <div className="p-4 space-y-4">
                            <WeeklyTimesheet timesheet={timesheet} />
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
