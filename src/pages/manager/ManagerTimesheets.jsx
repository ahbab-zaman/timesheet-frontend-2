import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Users,
  Clock,
  Filter,
  Search,
  ChevronDown,
  ChevronRight,
  Calendar as CalendarIcon,
  AlertTriangle,
  ChevronLeft,
  Check,
} from "lucide-react";
import {
  format,
  startOfWeek,
  endOfWeek,
  addDays,
  startOfMonth,
  endOfMonth,
  addMonths,
} from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import axiosInstance from "../../services/axiosInstance";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const ManagerTimesheets = ({ refreshTimesheetsCallback }) => {
  const [timesheets, setTimesheets] = useState([]);
  const [allTimesheetsState, setAllTimesheetsState] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [viewMode, setViewMode] = useState("week");
  const [employeeSearchTerm, setEmployeeSearchTerm] = useState("");
  const [expandedTimesheets, setExpandedTimesheets] = useState({});
  const [dateRange, setDateRange] = useState({
    start: startOfWeek(new Date(), { weekStartsOn: 1 }),
    end: endOfWeek(new Date(), { weekStartsOn: 1 }),
  });
  const [currentPeriodStart, setCurrentPeriodStart] = useState(
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [selectedTimesheetId, setSelectedTimesheetId] = useState(null);
  const [actionType, setActionType] = useState("");
  const [reason, setReason] = useState("");
  const [holidays, setHolidays] = useState([]);
  const [allLeaves, setAllLeaves] = useState([]);

  // FIX: Standardized keys to snake_case for consistency with backend
  const [statusCounts, setStatusCounts] = useState({
    waiting_for_approval: 0,
    approved: 0,
    rejected: 0,
    revision_requested: 0,
    all: 0,
  });

  // FIX: Updated values to snake_case to match backend ENUM
  const filterOptions = [
    {
      value: "all",
      label: "All Timesheets",
      icon: "📋",
      count: statusCounts.all,
    },
    {
      value: "waiting_for_approval",
      label: "Waiting for Approval",
      icon: "⏳",
      count: statusCounts.waiting_for_approval,
      color: "text-yellow-600",
    },
    {
      value: "approved",
      label: "Approved",
      icon: "✓",
      count: statusCounts.approved,
      color: "text-green-600",
    },
    {
      value: "rejected",
      label: "Rejected",
      icon: "✗",
      count: statusCounts.rejected,
      color: "text-red-600",
    },
    {
      value: "revision_requested",
      label: "Revision Requested",
      icon: "↺",
      count: statusCounts.revision_requested,
      color: "text-orange-600",
    },
  ];

  const periodDisplay =
    viewMode === "week"
      ? `${format(currentPeriodStart, "MMM dd")} - ${format(
          addDays(currentPeriodStart, 6),
          "MMM dd, yyyy"
        )}`
      : format(currentPeriodStart, "MMMM yyyy");

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    setExpandedTimesheets({});
    if (mode === "week") {
      const weekStart = startOfWeek(currentPeriodStart, { weekStartsOn: 1 });
      setCurrentPeriodStart(weekStart);
      setDateRange({
        start: weekStart,
        end: endOfWeek(weekStart, { weekStartsOn: 1 }),
      });
    } else {
      const monthStart = startOfMonth(currentPeriodStart);
      setCurrentPeriodStart(monthStart);
      setDateRange({
        start: monthStart,
        end: endOfMonth(monthStart),
      });
    }
  };

  const refreshTimesheets = async () => {
    setLoading(true);
    try {
      let params = {};

      // For weekly view, pass week_start and week_end
      // For monthly view, don't pass date params - fetch all and filter client-side
      if (viewMode === "week") {
        params = {
          week_start: format(dateRange.start, "yyyy-MM-dd"),
          week_end: format(dateRange.end, "yyyy-MM-dd"),
        };
      }

      console.log("Fetching timesheets:", { viewMode, params, dateRange });

      const response = await axiosInstance.get("/api/v1/time/timesheets/all", {
        params,
      });

      let allTimesheets = Array.isArray(response.data)
        ? response.data
        : response.data?.timesheets || [];

      console.log("Raw API response:", allTimesheets.length, "timesheets");

      // For monthly view, filter timesheets by date range client-side
      let filteredByDate = allTimesheets;
      if (viewMode === "month") {
        const periodStart = new Date(dateRange.start);
        const periodEnd = new Date(dateRange.end);

        filteredByDate = allTimesheets.filter((ts) => {
          const tsStart = new Date(ts.week_start_date);
          const tsEnd = new Date(ts.week_end_date);
          // Include timesheet if it overlaps with the selected month
          return tsStart <= periodEnd && tsEnd >= periodStart;
        });

        console.log("Filtered by month:", filteredByDate.length, "timesheets");
      }

      // Map to consistent structure
      const mappedTimesheets = filteredByDate.map((timesheet) => ({
        ...timesheet,
        employees: {
          id: timesheet.employee?.id || timesheet.employee_id || "Unknown",
          name: timesheet.employee?.name || "Unknown",
          email: timesheet.employee?.email || "Unknown",
        },
        entries: timesheet.entries || [],
        displayedTotal:
          timesheet.entries?.reduce(
            (sum, entry) => sum + (Number(entry.hours) || 0),
            0
          ) || 0,
      }));

      // Fetch holidays and leaves
      const holidayPromise = axiosInstance.get("/api/v1/holiday");
      const leavePromise = axiosInstance.get("/api/v1/leave", {
        params: { page: 1, limit: 1000 },
      });
      const [holidayRes, leaveRes] = await Promise.all([
        holidayPromise,
        leavePromise,
      ]);
      setHolidays(holidayRes.data.data || []);
      setAllLeaves(leaveRes.data.leaves || []);

      setAllTimesheetsState(mappedTimesheets);

      // FIX: Updated to snake_case for filtering/counts consistency
      const counts = {
        waiting_for_approval: mappedTimesheets.filter(
          (t) => t.status === "waiting_for_approval"
        ).length,
        approved: mappedTimesheets.filter((t) => t.status === "approved")
          .length,
        rejected: mappedTimesheets.filter((t) => t.status === "rejected")
          .length,
        revision_requested: mappedTimesheets.filter(
          (t) => t.status === "revision_requested"
        ).length,
        all: mappedTimesheets.length,
      };
      setStatusCounts(counts);

      // Apply status filter (client-side)
      let filtered = mappedTimesheets;
      if (filter !== "all") {
        filtered = mappedTimesheets.filter((t) => t.status === filter);
      }

      console.log("Final filtered timesheets:", filtered.length);
      setTimesheets(filtered);
    } catch (error) {
      toast.error("Failed to fetch timesheets. Please try again.");
      console.error("Error fetching timesheets:", error);
      setTimesheets([]);
      setAllTimesheetsState([]);
      setHolidays([]);
      setAllLeaves([]);
      setStatusCounts({
        waiting_for_approval: 0,
        approved: 0,
        rejected: 0,
        revision_requested: 0,
        all: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    setExpandedTimesheets({});
  };

  const handlePreviousPeriod = () => {
    if (viewMode === "week") {
      const newStart = addDays(currentPeriodStart, -7);
      setCurrentPeriodStart(newStart);
      setDateRange({
        start: newStart,
        end: addDays(newStart, 6),
      });
    } else {
      const newStart = addMonths(currentPeriodStart, -1);
      setCurrentPeriodStart(newStart);
      setDateRange({
        start: newStart,
        end: endOfMonth(newStart),
      });
    }
  };

  const handleNextPeriod = () => {
    if (viewMode === "week") {
      const newStart = addDays(currentPeriodStart, 7);
      setCurrentPeriodStart(newStart);
      setDateRange({
        start: newStart,
        end: addDays(newStart, 6),
      });
    } else {
      const newStart = addMonths(currentPeriodStart, 1);
      setCurrentPeriodStart(newStart);
      setDateRange({
        start: newStart,
        end: endOfMonth(newStart),
      });
    }
  };

  const handleDateSelect = (date) => {
    if (date) {
      if (viewMode === "week") {
        const weekStart = startOfWeek(date, { weekStartsOn: 1 });
        setCurrentPeriodStart(weekStart);
        setDateRange({
          start: weekStart,
          end: endOfWeek(weekStart, { weekStartsOn: 1 }),
        });
      } else {
        const monthStart = startOfMonth(date);
        setCurrentPeriodStart(monthStart);
        setDateRange({
          start: monthStart,
          end: endOfMonth(monthStart),
        });
      }
    }
  };

  const openActionModal = (timesheetId, type) => {
    setSelectedTimesheetId(timesheetId);
    setActionType(type);
    setReason("");
    setIsActionModalOpen(true);
  };

  const handleSubmitAction = async () => {
    let endpoint, successMsg, actionVerb, newStatus, newFilter;
    switch (actionType) {
      case "approve":
        endpoint = "/approve";
        successMsg = "Timesheet approved successfully!";
        actionVerb = "approving";
        newStatus = "approved";
        newFilter = "approved";
        break;
      case "reject":
        endpoint = "/reject";
        successMsg = "Timesheet rejected successfully!";
        actionVerb = "rejecting";
        newStatus = "rejected";
        newFilter = "rejected";
        break;
      case "revision":
        endpoint = "/request-revision";
        successMsg = "Revision requested successfully!";
        actionVerb = "requesting revision";
        newStatus = "revision_requested";
        newFilter = "revision_requested";
        break;
    }

    try {
      setIsActionModalOpen(false);

      await axiosInstance.patch(
        `/api/v1/time/timesheets/${selectedTimesheetId}${endpoint}`,
        { remarks: reason }
      );

      setFilter(newFilter);
      await refreshTimesheets();

      toast.success(successMsg);
      setReason("");
    } catch (error) {
      toast.error(`Failed to ${actionVerb} timesheet. Please try again.`);
      console.error(
        `Error ${actionVerb}:`,
        error.response?.data || error.message
      );
    }
  };

  // FIX: Updated cases to snake_case
  const getHeaderBadge = (status, totalHours) => {
    let label, bgClass, textClass, borderClass;
    switch (status) {
      case "waiting_for_approval":
        label = "Waiting for Approval";
        bgClass = "bg-yellow-100";
        textClass = "text-yellow-800";
        borderClass = "border-yellow-200";
        break;
      case "approved":
        label = "Approved";
        bgClass = "bg-green-100";
        textClass = "text-green-800";
        borderClass = "border-green-200";
        break;
      case "rejected":
        label = "Rejected";
        bgClass = "bg-red-100";
        textClass = "text-red-800";
        borderClass = "border-red-200";
        break;
      case "revision_requested":
        label = "Revision";
        bgClass = "bg-orange-100";
        textClass = "text-orange-800";
        borderClass = "border-orange-200";
        break;
      default:
        label = "Waiting for Approval";
        bgClass = "bg-yellow-100";
        textClass = "text-yellow-800";
        borderClass = "border-yellow-200";
    }
    return (
      <Badge
        variant="secondary"
        className={`${bgClass} ${textClass} ${borderClass} text-sm py-2 px-3`}
      >
        {label} • {Math.round(totalHours)}h
      </Badge>
    );
  };

  // FIX: Updated cases to snake_case, added explicit waiting case
  const getReviewStatus = (status) => {
    switch (status) {
      case "waiting_for_approval":
        return "⏳ Waiting for Approval";
      case "approved":
        return "✓ Approved";
      case "rejected":
        return "✗ Rejected";
      case "revision_requested":
        return "↺ Revision Requested";
      default:
        return "⏳ Waiting for Approval";
    }
  };

  const toggleTimesheet = (timesheetId) => {
    setExpandedTimesheets((prev) => ({
      ...prev,
      [timesheetId]: !prev[timesheetId],
    }));
  };

  const getCurrentFilterLabel = () => {
    const currentFilter = filterOptions.find((opt) => opt.value === filter);
    return currentFilter ? currentFilter.label : "All Timesheets";
  };

  // FIX: Helper to get count for a filter (dynamic, avoids hardcoding in JSX)
  const getFilterCount = (filterValue) => {
    switch (filterValue) {
      case "waiting_for_approval":
        return statusCounts.waiting_for_approval;
      case "approved":
        return statusCounts.approved;
      case "rejected":
        return statusCounts.rejected;
      case "revision_requested":
        return statusCounts.revision_requested;
      default:
        return statusCounts.all;
    }
  };

  useEffect(() => {
    refreshTimesheets();
  }, [filter, dateRange, viewMode]);

  useEffect(() => {
    if (refreshTimesheetsCallback) {
      refreshTimesheetsCallback(refreshTimesheets);
    }
  }, [refreshTimesheetsCallback]);

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

  const filteredTimesheets = timesheets.filter(
    (timesheet) =>
      timesheet.employees?.name
        ?.toLowerCase()
        .includes(employeeSearchTerm.toLowerCase()) ||
      timesheet.employees?.email
        ?.toLowerCase()
        .includes(employeeSearchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-100">
      <div className="mx-auto">
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center flex-wrap">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Filter className="h-4 w-4" />
                  <span className="font-medium">{getCurrentFilterLabel()}</span>
                  <Badge variant="secondary" className="ml-1">
                    {/* FIX: Use dynamic helper */}
                    {getFilterCount(filter)}
                  </Badge>
                  <ChevronDown className="h-4 w-4 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                {filterOptions.map((option) => (
                  <DropdownMenuItem
                    key={option.value}
                    onClick={() => handleFilterChange(option.value)}
                    className="flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <span className={option.color}>{option.icon}</span>
                      <span>{option.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {option.count}
                      </Badge>
                      {filter === option.value && (
                        <Check className="h-4 w-4 text-primary" />
                      )}
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handlePreviousPeriod}
                className="text-sm"
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>
              <div className="flex gap-1">
                <Button
                  variant={viewMode === "week" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleViewModeChange("week")}
                  className="px-3"
                >
                  Weekly
                </Button>
                <Button
                  variant={viewMode === "month" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleViewModeChange("month")}
                  className="px-3"
                >
                  Monthly
                </Button>
              </div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-64 justify-start text-left text-sm"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {periodDisplay}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={currentPeriodStart}
                    onSelect={handleDateSelect}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleNextPeriod}
                className="text-sm"
              >
                Next
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
          </div>
        </div>

        <div className="grid gap-4">
          {filteredTimesheets.length === 0 ? (
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
                    : filter === "all"
                    ? `No timesheets available for ${periodDisplay}.`
                    : `No ${filter.replace(
                        /_/g,
                        " "
                      )} timesheets found for ${periodDisplay}.`}{" "}
                  {/* FIX: Global replace for labels */}
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
              const displayTotal =
                timesheet.displayedTotal || timesheet.total_hours;
              const weekStartDate = new Date(timesheet.week_start_date);
              const weekEndDate = new Date(timesheet.week_end_date);
              const timesheetDates = Array.from({ length: 7 }, (_, i) =>
                addDays(weekStartDate, i)
              );
              const dailyTotals = {};
              timesheetDates.forEach((date) => {
                const dayKey = format(date, "yyyy-MM-dd");
                dailyTotals[dayKey] = timesheet.entries
                  .filter(
                    (e) => format(new Date(e.date), "yyyy-MM-dd") === dayKey
                  )
                  .reduce((sum, e) => sum + (parseFloat(e.hours) || 0), 0);
              });

              const employeeId = timesheet.employees.id;
              const employeeLeaves = allLeaves.filter(
                (l) =>
                  Number(l.createdBy) === Number(employeeId) &&
                  l.status === "Approved"
              );

              const isHolidayDay = (date) => {
                return holidays.some((h) => {
                  const hDate = new Date(h.start_date);
                  return (
                    format(date, "yyyy-MM-dd") === format(hDate, "yyyy-MM-dd")
                  );
                });
              };

              const isLeaveDay = (date) => {
                const dateStr = format(date, "yyyy-MM-dd");
                return employeeLeaves.some((l) => {
                  const startStr = format(new Date(l.fromDate), "yyyy-MM-dd");
                  const endStr = format(
                    new Date(l.toDate || l.fromDate),
                    "yyyy-MM-dd"
                  );
                  return dateStr >= startStr && dateStr <= endStr;
                });
              };

              return (
                <Card
                  key={timesheet.id}
                  className="overflow-hidden rounded-lg border hover:shadow-md transition-shadow"
                >
                  <div
                    className="flex items-start justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => toggleTimesheet(timesheet.id)}
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div
                        className={`h-4 w-4 transition-transform ${
                          isExpanded ? "rotate-180" : ""
                        }`}
                      >
                        {isExpanded ? <ChevronDown /> : <ChevronRight />}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-base">
                          {timesheet.employees.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          Week: {format(weekStartDate, "MMM dd")} -{" "}
                          {format(weekEndDate, "MMM dd, yyyy")}
                        </div>
                        <div className="text-xs text-gray-500">
                          {timesheet.employees.email}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      {getHeaderBadge(timesheet.status, displayTotal)}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="border-t p-4 space-y-4">
                      <div className="overflow-x-auto rounded-lg border border-gray-200">
                        <table className="w-full">
                          <thead className="bg-gray-100">
                            <tr>
                              <th className="border border-gray-200 p-3 text-left font-medium text-gray-900">
                                Task Name
                              </th>
                              {timesheetDates.map((date, index) => (
                                <th
                                  key={index}
                                  className="border border-gray-200 p-3 text-center"
                                >
                                  <span className="font-medium text-gray-900 uppercase tracking-wide text-xs block">
                                    {format(date, "EEE")}
                                  </span>
                                  <span className="font-semibold text-gray-900 text-sm block">
                                    {format(date, "dd")}
                                  </span>
                                </th>
                              ))}
                              <th className="border border-gray-200 p-3 text-center font-medium text-gray-900">
                                Total
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {(() => {
                              const grouped = {};
                              timesheet.entries.forEach((entry) => {
                                const taskName = entry.description || "No Task";
                                const dayKey = format(
                                  new Date(entry.date),
                                  "yyyy-MM-dd"
                                );
                                if (!grouped[taskName]) grouped[taskName] = {};
                                if (!grouped[taskName][dayKey])
                                  grouped[taskName][dayKey] = 0;
                                grouped[taskName][dayKey] +=
                                  parseFloat(entry.hours) || 0;
                              });
                              const tasks = Object.keys(grouped).sort();
                              return tasks.map((task) => {
                                const taskDaily = grouped[task];
                                const taskTotal = Object.values(
                                  taskDaily
                                ).reduce((a, b) => a + b, 0);
                                return (
                                  <tr key={task} className="hover:bg-gray-50">
                                    <td className="border border-gray-200 p-3 font-medium text-gray-900">
                                      {task}
                                    </td>
                                    {timesheetDates.map((date, i) => {
                                      const dayKey = format(date, "yyyy-MM-dd");
                                      const h = taskDaily[dayKey] || 0;
                                      const isNonWorkDay =
                                        isHolidayDay(date) || isLeaveDay(date);
                                      const displayHours = isNonWorkDay ? 0 : h;
                                      const cellClass = isNonWorkDay
                                        ? "bg-gray-50 opacity-50"
                                        : "";
                                      const textClass = isNonWorkDay
                                        ? "text-gray-400"
                                        : "text-sm font-medium text-gray-900";
                                      return (
                                        <td
                                          key={i}
                                          className={`border border-gray-200 p-3 text-center ${cellClass}`}
                                        >
                                          <span className={textClass}>
                                            {displayHours > 0
                                              ? `${Math.round(displayHours)}h`
                                              : "-"}
                                          </span>
                                        </td>
                                      );
                                    })}
                                    <td className="border border-gray-200 p-3 text-center font-semibold text-gray-900">
                                      {Math.round(taskTotal)}h
                                    </td>
                                  </tr>
                                );
                              });
                            })()}
                            <tr className="bg-gray-50">
                              <td className="border border-gray-200 p-3 font-semibold text-gray-900">
                                Total Hours
                              </td>
                              {timesheetDates.map((date, i) => {
                                const dayKey = format(date, "yyyy-MM-dd");
                                const hours = dailyTotals[dayKey] || 0;
                                const isHoliday = isHolidayDay(date);
                                const isLeave = !isHoliday && isLeaveDay(date);
                                let cellContent = "-";
                                let textClass = "text-gray-900";
                                if (isHoliday) {
                                  cellContent = "Holiday";
                                  textClass = "text-orange-600";
                                } else if (isLeave) {
                                  cellContent = "Leave";
                                  textClass = "text-blue-600";
                                } else if (hours > 0) {
                                  cellContent = `${Math.round(hours)}h`;
                                  textClass = "text-gray-900";
                                }
                                return (
                                  <td
                                    key={i}
                                    className="border border-gray-200 p-3 text-center font-semibold"
                                  >
                                    <span
                                      className={`font-medium ${textClass}`}
                                    >
                                      {cellContent}
                                    </span>
                                  </td>
                                );
                              })}
                              <td className="border border-gray-200 p-3 text-center font-bold text-gray-900">
                                {Math.round(displayTotal)}h
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>

                      <div>
                        <span className="text-sm font-medium text-gray-600">
                          Comments:
                        </span>
                        {timesheet.comments ? (
                          <div className="bg-gray-100 p-3 rounded-md mt-2">
                            <p className="text-sm text-gray-600">
                              {timesheet.comments}
                            </p>
                          </div>
                        ) : (
                          <div className="text-sm text-gray-400 mt-2">
                            No comments yet.
                          </div>
                        )}
                      </div>

                      <div className="bg-gray-50 rounded-md p-3">
                        <div className="flex items-center gap-1 mb-2">
                          <AlertTriangle className="h-4 w-4 text-yellow-500" />
                          <span className="text-sm font-medium text-gray-600">
                            Approval Status
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <div>
                            Week: {format(weekStartDate, "MM/dd/yyyy")} -{" "}
                            {format(weekEndDate, "MM/dd/yyyy")}
                          </div>
                          <div className="font-medium">
                            Total Hours: {Math.round(displayTotal)}
                          </div>
                        </div>
                        <div className="text-sm font-medium text-gray-700 mt-1">
                          {getReviewStatus(timesheet.status)}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="default"
                          className="flex-1 bg-green-600 hover:bg-green-700"
                          onClick={(e) => {
                            e.stopPropagation();
                            openActionModal(timesheet.id, "approve");
                          }}
                          disabled={timesheet.status === "approved"}
                        >
                          ✓ Approve
                        </Button>
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            openActionModal(timesheet.id, "revision");
                          }}
                        >
                          ↺ Request Revision
                        </Button>
                        <Button
                          variant="destructive"
                          className="flex-1 bg-red-600 hover:bg-red-700"
                          onClick={(e) => {
                            e.stopPropagation();
                            openActionModal(timesheet.id, "reject");
                          }}
                          disabled={timesheet.status === "rejected"}
                        >
                          ✗ Reject
                        </Button>
                      </div>
                    </div>
                  )}
                </Card>
              );
            })
          )}
        </div>
      </div>

      <Dialog open={isActionModalOpen} onOpenChange={setIsActionModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {actionType === "revision"
                ? "Request Revision"
                : actionType.charAt(0).toUpperCase() + actionType.slice(1)}{" "}
              Timesheet
            </DialogTitle>
            {selectedTimesheetId && (
              <DialogDescription>
                Employee:{" "}
                {
                  allTimesheetsState.find((t) => t.id === selectedTimesheetId)
                    ?.employees.name
                }
              </DialogDescription>
            )}
          </DialogHeader>
          <div className="space-y-2">
            <label htmlFor="reason" className="text-sm font-medium">
              Reason {actionType === "approve" ? "(optional)" : "(required)"}
            </label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={
                actionType === "revision"
                  ? "Enter comments for the revision request..."
                  : `Enter your reason for ${actionType}ing this timesheet...`
              }
              className="min-h-[100px]"
            />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsActionModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="button" onClick={handleSubmitAction}>
              {actionType === "revision"
                ? "Request Revision"
                : actionType.charAt(0).toUpperCase() + actionType.slice(1)}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ManagerTimesheets;
