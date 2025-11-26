import React, { useState, useEffect } from "react";
import axiosInstance from "@/services/axiosInstance";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, ChevronLeft, ChevronRight, Users } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const TimesheetsView = () => {
  const [viewType, setViewType] = useState("weekly");
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState("all");
  const [timesheetsData, setTimesheetsData] = useState([]);
  const [currentPeriod, setCurrentPeriod] = useState({
    start: null,
    end: null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [totalHours, setTotalHours] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Fetch all employees
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await axiosInstance.get("/api/v1/employee");
        const empData = response.data || [];
        const employeesArray = Array.isArray(empData)
          ? empData
          : empData.data || empData.employees || [];
        setEmployees(employeesArray);
      } catch (error) {
        console.error("Failed to fetch employees:", error);
        toast.error("Failed to load employees");
        setEmployees([]);
      }
    };
    fetchEmployees();
  }, []);

  // Initialize current period based on view
  useEffect(() => {
    console.log("🔄 useEffect triggered! Current viewType:", viewType); // Log 1: Does it fire on tab switch?

    const today = new Date("2025-11-13");
    console.log("📅 Today year from new Date():", today.getFullYear()); // Log 2: Should log 2025

    let start, end;

    if (viewType === "weekly") {
      const day = today.getDay();
      start = new Date(today);
      start.setDate(today.getDate() - day + (day === 0 ? -6 : 1));
      end = new Date(start);
      end.setDate(start.getDate() + 6);
    } else if (viewType === "monthly") {
      start = new Date(Date.UTC(today.getFullYear(), today.getMonth(), 1));
      end = new Date(Date.UTC(today.getFullYear(), today.getMonth() + 1, 0));
    } else if (viewType === "yearly") {
      start = new Date(Date.UTC(today.getFullYear(), 0, 1));
      end = new Date(Date.UTC(today.getFullYear(), 11, 31));
      console.log("🎯 Yearly period calculated:", {
        start: start.toISOString().split("T")[0],
        end: end.toISOString().split("T")[0],
        year: today.getFullYear(),
      }); // Log 3: Is it 2025 here?
    }

    const newPeriod = {
      start: start.toISOString().split("T")[0],
      end: end.toISOString().split("T")[0],
    };
    console.log("💾 Setting currentPeriod to:", newPeriod); // Log 4: Confirm before setState

    setCurrentPeriod(newPeriod);
  }, [viewType]);

  // Fetch timesheets
  const fetchTimesheets = async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.get("/api/v1/time/timesheets/all");

      let allTimesheets = response.data;
      if (allTimesheets && allTimesheets.timesheets) {
        allTimesheets = allTimesheets.timesheets;
      } else if (!Array.isArray(allTimesheets)) {
        allTimesheets = [];
      }

      // For all views, filter by date range
      const periodStart = new Date(currentPeriod.start);
      const periodEnd = new Date(currentPeriod.end);
      let filteredTimesheets = allTimesheets.filter((ts) => {
        const tsStart = new Date(ts.week_start_date);
        const tsEnd = new Date(ts.week_end_date);
        return tsStart <= periodEnd && tsEnd >= periodStart;
      });

      // Filter by selected employee if not "all"
      if (selectedEmployee !== "all") {
        filteredTimesheets = filteredTimesheets.filter(
          (ts) =>
            (ts.employee?.id || ts.employee_id) === parseInt(selectedEmployee)
        );
      }

      setTimesheetsData(filteredTimesheets);

      // Calculate total hours
      const total = filteredTimesheets.reduce(
        (sum, ts) =>
          sum +
          (ts.entries || []).reduce(
            (entrySum, entry) => entrySum + parseFloat(entry.hours || 0),
            0
          ),
        0
      );
      setTotalHours(total.toFixed(1));
    } catch (error) {
      console.error("Failed to fetch timesheets:", error);
      toast.error("Failed to load timesheets");
      setTimesheetsData([]);
      setTotalHours(0);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
    if (currentPeriod.start && currentPeriod.end) {
      fetchTimesheets();
    }
  }, [selectedEmployee, currentPeriod, viewType]);

  // Navigation handlers
  const handlePrevious = () => {
    let startDate, endDate;
    if (viewType === "weekly") {
      startDate = new Date(currentPeriod.start);
      startDate.setDate(startDate.getDate() - 7);
      endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 6);
    } else if (viewType === "monthly") {
      startDate = new Date(currentPeriod.start);
      startDate.setMonth(startDate.getMonth() - 1);
      endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);
    } else if (viewType === "yearly") {
      startDate = new Date(currentPeriod.start);
      startDate.setFullYear(startDate.getFullYear() - 1);
      endDate = new Date(startDate.getFullYear(), 11, 31);
    }
    setCurrentPeriod({
      start: startDate.toISOString().split("T")[0],
      end: endDate.toISOString().split("T")[0],
    });
  };

  const handleNext = () => {
    let startDate, endDate;
    if (viewType === "weekly") {
      startDate = new Date(currentPeriod.start);
      startDate.setDate(startDate.getDate() + 7);
      endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 6);
    } else if (viewType === "monthly") {
      startDate = new Date(currentPeriod.start);
      startDate.setMonth(startDate.getMonth() + 1);
      endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);
    } else if (viewType === "yearly") {
      startDate = new Date(currentPeriod.start);
      startDate.setFullYear(startDate.getFullYear() + 1);
      endDate = new Date(startDate.getFullYear(), 11, 31);
    }
    setCurrentPeriod({
      start: startDate.toISOString().split("T")[0],
      end: endDate.toISOString().split("T")[0],
    });
  };

  // Format day name
  const getDayName = (dateStr) => {
    return new Date(dateStr).toLocaleDateString("en-US", { weekday: "long" });
  };

  // Flatten entries for weekly table - grouped by employee
  const flattenWeeklyEntries = (timesheets) => {
    const rows = [];
    timesheets.forEach((ts) => {
      const employeeName = ts.employee?.name || "Unknown Employee";
      const employeeId = ts.employee?.id || ts.employee_id;

      (ts.entries || []).forEach((entry) => {
        const entryDate = entry.date ? entry.date.split("T")[0] : "";
        rows.push({
          employeeName,
          employeeId,
          date: entryDate,
          day: getDayName(entry.date),
          checkIn: entry.check_in || "-",
          checkOut: entry.check_out || "-",
          breakHrs: entry.break_hours || 0,
          hoursWorked: parseFloat(entry.hours || 0),
          workLog: entry.description || ts.comments || "No log",
          status: ts.status,
        });
      });
    });
    // Sort by employee name, then date
    rows.sort((a, b) => {
      const nameCompare = a.employeeName.localeCompare(b.employeeName);
      if (nameCompare !== 0) return nameCompare;
      return new Date(a.date) - new Date(b.date);
    });
    return rows;
  };

  const weeklyRows = flattenWeeklyEntries(timesheetsData);

  // Group by employee and week for monthly
  const groupByEmployeeAndWeek = (timesheets) => {
    const grouped = {};

    timesheets.forEach((ts) => {
      const employeeName = ts.employee?.name || "Unknown Employee";
      const employeeId = ts.employee?.id || ts.employee_id;
      const employeeKey = `${employeeId}_${employeeName}`;

      if (!grouped[employeeKey]) {
        grouped[employeeKey] = {
          employeeName,
          employeeId,
          weeks: {},
        };
      }

      const start = new Date(ts.week_start_date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      const end = new Date(ts.week_end_date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      const weekKey = `${start} - ${end}`;

      if (!grouped[employeeKey].weeks[weekKey]) {
        grouped[employeeKey].weeks[weekKey] = {
          totalHours: 0,
          entries: [],
          summary: ts.comments || "Regular work schedule",
          status: ts.status,
        };
      }

      const tsTotal = (ts.entries || []).reduce(
        (s, e) => s + parseFloat(e.hours || 0),
        0
      );
      grouped[employeeKey].weeks[weekKey].totalHours += tsTotal;
      grouped[employeeKey].weeks[weekKey].entries = grouped[employeeKey].weeks[
        weekKey
      ].entries.concat(ts.entries || []);
    });

    // Calculate working days and avg for each week
    const rows = [];
    Object.values(grouped).forEach((empData) => {
      Object.entries(empData.weeks).forEach(([weekKey, weekData]) => {
        const uniqueDates = [
          ...new Set(weekData.entries.map((entry) => entry.date.split("T")[0])),
        ];
        rows.push({
          employeeName: empData.employeeName,
          employeeId: empData.employeeId,
          week: weekKey,
          totalHours: weekData.totalHours,
          workingDays: uniqueDates.length,
          avgHours:
            uniqueDates.length > 0
              ? (weekData.totalHours / uniqueDates.length).toFixed(1)
              : 0,
          summary: weekData.summary,
          status: weekData.status,
        });
      });
    });

    // Sort by employee name, then week
    rows.sort((a, b) => a.employeeName.localeCompare(b.employeeName));
    return rows;
  };

  const monthlyRows = groupByEmployeeAndWeek(timesheetsData);

  // Group by employee and month for yearly
  const groupByEmployeeAndMonth = (timesheets) => {
    const grouped = {};

    timesheets.forEach((ts) => {
      const employeeName = ts.employee?.name || "Unknown Employee";
      const employeeId = ts.employee?.id || ts.employee_id;
      const employeeKey = `${employeeId}_${employeeName}`;

      if (!grouped[employeeKey]) {
        grouped[employeeKey] = {
          employeeName,
          employeeId,
          months: {},
        };
      }

      // Use the week_start_date to determine the month and year
      const weekStartDate = new Date(ts.week_start_date);
      const monthKey = weekStartDate.toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      });

      if (!grouped[employeeKey].months[monthKey]) {
        grouped[employeeKey].months[monthKey] = {
          totalHours: 0,
          entries: [],
          summary: ts.comments || "Regular work schedule",
          status: ts.status,
          monthDate: weekStartDate, // Store for sorting
        };
      }

      const tsTotal = (ts.entries || []).reduce(
        (s, e) => s + parseFloat(e.hours || 0),
        0
      );
      grouped[employeeKey].months[monthKey].totalHours += tsTotal;
      grouped[employeeKey].months[monthKey].entries = grouped[
        employeeKey
      ].months[monthKey].entries.concat(ts.entries || []);
    });

    // Calculate working days and avg for each month
    const rows = [];
    Object.values(grouped).forEach((empData) => {
      Object.entries(empData.months).forEach(([monthKey, monthData]) => {
        const uniqueDates = [
          ...new Set(
            monthData.entries.map((entry) => entry.date.split("T")[0])
          ),
        ];
        rows.push({
          employeeName: empData.employeeName,
          employeeId: empData.employeeId,
          month: monthKey,
          monthDate: monthData.monthDate,
          totalHours: monthData.totalHours,
          workingDays: uniqueDates.length,
          avgHours:
            uniqueDates.length > 0
              ? (monthData.totalHours / uniqueDates.length).toFixed(1)
              : 0,
          summary: monthData.summary,
          status: monthData.status,
        });
      });
    });

    // Sort by employee name, then by month chronologically
    rows.sort((a, b) => {
      const nameCompare = a.employeeName.localeCompare(b.employeeName);
      if (nameCompare !== 0) return nameCompare;
      return new Date(a.monthDate) - new Date(b.monthDate);
    });
    return rows;
  };

  const yearlyRows = groupByEmployeeAndMonth(timesheetsData);

  // Format period display
  const getPeriodDisplay = () => {
    if (!currentPeriod.start || !currentPeriod.end) return "";

    console.log(
      "📊 getPeriodDisplay called with currentPeriod:",
      currentPeriod
    ); // Log 5: What's state at render time?

    if (viewType === "weekly") {
      return `${new Date(currentPeriod.start).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })} - ${new Date(currentPeriod.end).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })}`;
    } else if (viewType === "monthly") {
      return new Date(currentPeriod.start).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      });
    } else {
      // For yearly view, use the start date's year
      const yearDate = new Date(currentPeriod.start);
      const displayYear = yearDate.getFullYear();
      console.log("📅 Extracted year from currentPeriod.start:", displayYear); // Log 6: Final year before return
      return displayYear.toString();
    }
  };

  // Get status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case "approved":
        return "bg-green-500";
      case "pending":
        return "bg-yellow-500";
      case "rejected":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading timesheets...</div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Timesheet View -{" "}
            {selectedEmployee === "all"
              ? "All Employees"
              : employees.find((e) => e.id === parseInt(selectedEmployee))
                  ?.name}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <Tabs value={viewType} onValueChange={setViewType}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="weekly">Weekly</TabsTrigger>
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
              <TabsTrigger value="yearly">Yearly</TabsTrigger>
            </TabsList>

            {/* Weekly View */}
            <TabsContent value="weekly" className="space-y-4">
              <div className="flex items-center justify-between">
                <Select
                  value={selectedEmployee}
                  onValueChange={setSelectedEmployee}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Select Employee" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Employees</SelectItem>
                    {Array.isArray(employees) &&
                      employees.map((emp) => (
                        <SelectItem key={emp.id} value={emp.id.toString()}>
                          {emp.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={handlePrevious}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm font-medium">
                    {getPeriodDisplay()}
                  </span>
                  <Button variant="outline" size="sm" onClick={handleNext}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {selectedEmployee === "all" && (
                        <TableHead>Employee</TableHead>
                      )}
                      <TableHead>Date</TableHead>
                      <TableHead>Day</TableHead>
                      <TableHead>Check-in</TableHead>
                      <TableHead>Check-out</TableHead>
                      <TableHead>Break (hrs)</TableHead>
                      <TableHead>Hours Worked</TableHead>
                      <TableHead>Work Log</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(() => {
                      const paginatedRows = weeklyRows.slice(
                        (currentPage - 1) * itemsPerPage,
                        currentPage * itemsPerPage
                      );
                      const totalPages = Math.ceil(
                        weeklyRows.length / itemsPerPage
                      );
                      if (paginatedRows.length === 0) {
                        return (
                          <TableRow>
                            <TableCell
                              colSpan={selectedEmployee === "all" ? 9 : 8}
                              className="text-center py-8 text-gray-500"
                            >
                              No timesheet entries for this week
                            </TableCell>
                          </TableRow>
                        );
                      }
                      return paginatedRows.map((row, index) => (
                        <TableRow key={`${viewType}-weekly-${index}`}>
                          {selectedEmployee === "all" && (
                            <TableCell className="font-medium">
                              {row.employeeName}
                            </TableCell>
                          )}
                          <TableCell>
                            {row.date
                              ? new Date(row.date).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })
                              : "-"}
                          </TableCell>
                          <TableCell>{row.day}</TableCell>
                          <TableCell>{row.checkIn}</TableCell>
                          <TableCell>{row.checkOut}</TableCell>
                          <TableCell>{row.breakHrs}</TableCell>
                          <TableCell>{row.hoursWorked.toFixed(2)}</TableCell>
                          <TableCell className="max-w-xs truncate">
                            {row.workLog}
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(row.status)}>
                              {row.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ));
                    })()}
                  </TableBody>
                </Table>
              </div>
              {(() => {
                const totalPages = Math.ceil(weeklyRows.length / itemsPerPage);
                return (
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="text-lg font-bold">
                      Weekly Total: {totalHours}h
                    </div>
                    {totalPages > 1 && (
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setCurrentPage((prev) => Math.max(prev - 1, 1))
                          }
                          disabled={currentPage === 1}
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <span className="text-sm font-medium">
                          Page {currentPage} of {totalPages}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setCurrentPage((prev) =>
                              Math.min(prev + 1, totalPages)
                            )
                          }
                          disabled={currentPage === totalPages}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })()}
            </TabsContent>

            {/* Monthly View */}
            <TabsContent value="monthly" className="space-y-4">
              <div className="flex items-center justify-between">
                <Select
                  value={selectedEmployee}
                  onValueChange={setSelectedEmployee}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Select Employee" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Employees</SelectItem>
                    {Array.isArray(employees) &&
                      employees.map((emp) => (
                        <SelectItem key={emp.id} value={emp.id.toString()}>
                          {emp.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={handlePrevious}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm font-medium">
                    {getPeriodDisplay()}
                  </span>
                  <Button variant="outline" size="sm" onClick={handleNext}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {selectedEmployee === "all" && (
                        <TableHead>Employee</TableHead>
                      )}
                      <TableHead>Week</TableHead>
                      <TableHead>Total Hours</TableHead>
                      <TableHead>Working Days</TableHead>
                      <TableHead>Avg Hours/Day</TableHead>
                      <TableHead>Summary</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(() => {
                      const paginatedRows = monthlyRows.slice(
                        (currentPage - 1) * itemsPerPage,
                        currentPage * itemsPerPage
                      );
                      const totalPages = Math.ceil(
                        monthlyRows.length / itemsPerPage
                      );
                      if (paginatedRows.length === 0) {
                        return (
                          <TableRow>
                            <TableCell
                              colSpan={selectedEmployee === "all" ? 7 : 6}
                              className="text-center py-8 text-gray-500"
                            >
                              No timesheet data for this month
                            </TableCell>
                          </TableRow>
                        );
                      }
                      return paginatedRows.map((row, index) => (
                        <TableRow key={`${viewType}-monthly-${index}`}>
                          {selectedEmployee === "all" && (
                            <TableCell className="font-medium">
                              {row.employeeName}
                            </TableCell>
                          )}
                          <TableCell>{row.week}</TableCell>
                          <TableCell>{row.totalHours.toFixed(1)}</TableCell>
                          <TableCell>{row.workingDays}</TableCell>
                          <TableCell>{row.avgHours}</TableCell>
                          <TableCell className="max-w-xs truncate">
                            {row.summary}
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(row.status)}>
                              {row.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ));
                    })()}
                  </TableBody>
                </Table>
              </div>
              {(() => {
                const totalPages = Math.ceil(monthlyRows.length / itemsPerPage);
                return (
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="text-lg font-bold">
                      Monthly Total: {totalHours}h
                    </div>
                    {totalPages > 1 && (
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setCurrentPage((prev) => Math.max(prev - 1, 1))
                          }
                          disabled={currentPage === 1}
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <span className="text-sm font-medium">
                          Page {currentPage} of {totalPages}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setCurrentPage((prev) =>
                              Math.min(prev + 1, totalPages)
                            )
                          }
                          disabled={currentPage === totalPages}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })()}
            </TabsContent>

            {/* Yearly View */}
            <TabsContent value="yearly" className="space-y-4">
              {console.log(
                "🖥️ Rendering yearly tab with viewType:",
                viewType,
                "and period display:",
                getPeriodDisplay()
              )}{" "}
              {/* Log 7: Render time log */}
              <div className="flex items-center justify-between">
                <Select
                  value={selectedEmployee}
                  onValueChange={setSelectedEmployee}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Select Employee" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Employees</SelectItem>
                    {Array.isArray(employees) &&
                      employees.map((emp) => (
                        <SelectItem key={emp.id} value={emp.id.toString()}>
                          {emp.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={handlePrevious}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm font-medium">
                    {getPeriodDisplay()}
                  </span>
                  <Button variant="outline" size="sm" onClick={handleNext}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {selectedEmployee === "all" && (
                        <TableHead>Employee</TableHead>
                      )}
                      <TableHead>Month</TableHead>
                      <TableHead>Total Hours</TableHead>
                      <TableHead>Working Days</TableHead>
                      <TableHead>Avg Hours/Day</TableHead>
                      <TableHead>Summary</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(() => {
                      const paginatedRows = yearlyRows.slice(
                        (currentPage - 1) * itemsPerPage,
                        currentPage * itemsPerPage
                      );
                      const totalPages = Math.ceil(
                        yearlyRows.length / itemsPerPage
                      );
                      if (paginatedRows.length === 0) {
                        return (
                          <TableRow>
                            <TableCell
                              colSpan={selectedEmployee === "all" ? 7 : 6}
                              className="text-center py-8 text-gray-500"
                            >
                              No timesheet data for this year
                            </TableCell>
                          </TableRow>
                        );
                      }
                      return paginatedRows.map((row, index) => (
                        <TableRow key={`${viewType}-yearly-${index}`}>
                          {selectedEmployee === "all" && (
                            <TableCell className="font-medium">
                              {row.employeeName}
                            </TableCell>
                          )}
                          <TableCell>{row.month}</TableCell>
                          <TableCell>{row.totalHours.toFixed(1)}</TableCell>
                          <TableCell>{row.workingDays}</TableCell>
                          <TableCell>{row.avgHours}</TableCell>
                          <TableCell className="max-w-xs truncate">
                            {row.summary}
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(row.status)}>
                              {row.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ));
                    })()}
                  </TableBody>
                </Table>
              </div>
              {(() => {
                const totalPages = Math.ceil(yearlyRows.length / itemsPerPage);
                return (
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="text-lg font-bold">
                      Yearly Total: {totalHours}h
                    </div>
                    {totalPages > 1 && (
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setCurrentPage((prev) => Math.max(prev - 1, 1))
                          }
                          disabled={currentPage === 1}
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <span className="text-sm font-medium">
                          Page {currentPage} of {totalPages}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setCurrentPage((prev) =>
                              Math.min(prev + 1, totalPages)
                            )
                          }
                          disabled={currentPage === totalPages}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })()}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default TimesheetsView;