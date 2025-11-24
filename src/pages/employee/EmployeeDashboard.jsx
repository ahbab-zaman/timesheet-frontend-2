import { useState, useEffect, useMemo } from "react";
import {
  format,
  addDays,
  startOfWeek,
  endOfWeek,
  parse,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  addMonths,
  addWeeks,
} from "date-fns";
import { CalendarIcon, Loader2, ChevronDown } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import axiosInstance from "../../services/axiosInstance";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function EmployeeDashboard() {
  const [viewMode, setViewMode] = useState("week");
  const [currentPeriodStart, setCurrentPeriodStart] = useState(
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );
  const [isLoadingTimeEntries, setIsLoadingTimeEntries] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState(null);
  const [approvedLeaves, setApprovedLeaves] = useState([]);
  const [timeEntries, setTimeEntries] = useState([]);

  useEffect(() => {
    const now = new Date();
    let initial;
    if (viewMode === "week") initial = startOfWeek(now, { weekStartsOn: 1 });
    else if (viewMode === "month") initial = startOfMonth(now);
    else initial = startOfYear(now);
    setCurrentPeriodStart(initial);
  }, [viewMode]);

  const periodDates = useMemo(() => {
    if (viewMode === "week") {
      return Array.from({ length: 7 }, (_, i) =>
        addDays(currentPeriodStart, i)
      );
    } else if (viewMode === "month") {
      const endDate = endOfMonth(currentPeriodStart);
      const numDays = endDate.getDate();
      return Array.from({ length: numDays }, (_, i) =>
        addDays(currentPeriodStart, i)
      );
    } else {
      const months = [];
      let current = currentPeriodStart;
      for (let i = 0; i < 12; i++) {
        months.push(current);
        current = addMonths(current, 1);
      }
      return months;
    }
  }, [viewMode, currentPeriodStart]);

  const periodLabel = useMemo(() => {
    if (viewMode === "week")
      return `${format(periodDates[0], "MMM dd")} - ${format(
        periodDates[periodDates.length - 1],
        "dd, yyyy"
      )}`;
    else if (viewMode === "month")
      return format(currentPeriodStart, "MMMM yyyy");
    else return format(currentPeriodStart, "yyyy");
  }, [viewMode, periodDates, currentPeriodStart]);

  useEffect(() => {
    let mounted = true;
    const fetchEmployee = async () => {
      try {
        const res = await axiosInstance.get("/api/v1/employee/me");
        if (mounted) setCurrentEmployee(res.data.employee);
      } catch {
        toast.error("Failed to fetch employee details.");
      }
    };
    fetchEmployee();
    return () => (mounted = false);
  }, []);

  useEffect(() => {
    if (!currentEmployee) return;
    let mounted = true;
    const fetchLeaves = async () => {
      try {
        const res = await axiosInstance.get("/api/v1/leave/", {
          params: { createdBy: currentEmployee.id },
        });
        if (mounted) {
          const approved = (res.data.leaves || []).filter(
            (l) => l.status === "Approved"
          );
          setApprovedLeaves(approved);
        }
      } catch {
        toast.error("Failed to fetch leaves.");
      }
    };
    fetchLeaves();
    return () => (mounted = false);
  }, [currentEmployee]);

  const getLeaveForDate = (date) => {
    return approvedLeaves.find((leave) => {
      const start = parse(leave.fromDate, "yyyy-MM-dd", new Date());
      const end = parse(
        leave.toDate || leave.fromDate,
        "yyyy-MM-dd",
        new Date()
      );
      return start <= date && end >= date;
    });
  };

  const fetchTimeEntries = async (periodStart, periodEnd, employeeId) => {
    if (!employeeId) return;
    setIsLoadingTimeEntries(true);
    try {
      const res = await axiosInstance.get("/api/v1/time/timesheets/week", {
        params: {
          employee_id: employeeId,
          week_start: periodStart,
          week_end: periodEnd,
        },
      });
      // Map backend response to frontend expected fields
      const mappedEntries = (res.data.timeEntries || []).map((entry) => ({
        ...entry,
        date: entry.date, // assuming date is in yyyy-MM-dd
        hoursWorked: parseFloat(entry.hours) || 0,
        workLog: entry.workLog || "great", // assume or default
        status: res.data.status || "approved", // from timesheet
        checkIn: entry.checkIn || "-", // assume fields exist or default
        checkOut: entry.checkOut || "-",
        breakHours: entry.breakHours || 0,
      }));
      setTimeEntries(mappedEntries);
    } catch {
      toast.error("Failed to load time entries");
    } finally {
      setIsLoadingTimeEntries(false);
    }
  };

  const refreshTimeEntries = () => {
    if (!currentEmployee?.id) return;
    let ps, pe;
    if (viewMode === "week") {
      ps = format(currentPeriodStart, "yyyy-MM-dd");
      pe = format(
        endOfWeek(currentPeriodStart, { weekStartsOn: 1 }),
        "yyyy-MM-dd"
      );
    } else if (viewMode === "month") {
      const monthStart = startOfMonth(currentPeriodStart);
      const fetchStart = startOfWeek(monthStart, { weekStartsOn: 1 });
      const monthEnd = endOfMonth(currentPeriodStart);
      const fetchEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
      ps = format(fetchStart, "yyyy-MM-dd");
      pe = format(fetchEnd, "yyyy-MM-dd");
    } else {
      ps = format(currentPeriodStart, "yyyy-MM-dd");
      pe = format(endOfYear(currentPeriodStart), "yyyy-MM-dd");
    }
    fetchTimeEntries(ps, pe, currentEmployee.id);
  };

  useEffect(() => {
    if (!currentEmployee?.id) return;
    refreshTimeEntries();
  }, [currentEmployee, currentPeriodStart, viewMode]);

  const weeklyData = useMemo(() => {
    const data = [];
    const datesWithEntriesOrLeave = periodDates.filter((date) => {
      const leave = getLeaveForDate(date);
      if (leave) return true;
      const entryDateStr = format(date, "yyyy-MM-dd");
      return timeEntries.some((e) => e.date === entryDateStr);
    });
    datesWithEntriesOrLeave.forEach((date) => {
      const leave = getLeaveForDate(date);
      if (leave) {
        data.push({
          date,
          day: format(date, "EEEE"),
          checkIn: "-",
          checkOut: "-",
          breakHours: 0,
          hoursWorked: "Leave",
          workLog: "-",
          status: "approved",
        });
      } else {
        const entryDateStr = format(date, "yyyy-MM-dd");
        const entry = timeEntries.find((e) => e.date === entryDateStr);
        data.push({
          date,
          day: format(date, "EEEE"),
          checkIn: entry?.checkIn || "-",
          checkOut: entry?.checkOut || "-",
          breakHours: entry?.breakHours || 0,
          hoursWorked: entry?.hoursWorked || 0,
          workLog: entry?.workLog || "-",
          status: "approved",
        });
      }
    });
    return data;
  }, [periodDates, timeEntries, approvedLeaves]);

  const monthlyWeeks = useMemo(() => {
    const weeks = [];
    let weekStart = startOfWeek(startOfMonth(currentPeriodStart), {
      weekStartsOn: 1,
    });
    const monthEndPlus = addMonths(endOfMonth(currentPeriodStart), 1);
    while (weekStart < monthEndPlus) {
      const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
      if (
        weekEnd >= startOfMonth(currentPeriodStart) &&
        weekStart <= endOfMonth(currentPeriodStart)
      ) {
        weeks.push({
          start: weekStart,
          end: weekEnd,
          label: `${format(weekStart, "MMM d")} - ${format(weekEnd, "MMM d")}`,
        });
      }
      weekStart = addWeeks(weekStart, 1);
    }
    return weeks;
  }, [currentPeriodStart]);

  const monthlyData = useMemo(() => {
    return monthlyWeeks
      .map((week) => {
        const weekEntries = timeEntries.filter((e) => {
          const ed = new Date(e.date);
          return ed >= week.start && ed <= week.end;
        });
        const totalHours = weekEntries.reduce(
          (sum, e) => sum + (e.hoursWorked || 0),
          0
        );
        const workingDays = new Set(
          weekEntries.map((e) => format(new Date(e.date), "yyyy-MM-dd"))
        ).size;
        const avg =
          workingDays > 0 ? (totalHours / workingDays).toFixed(1) : "0.0";
        return {
          week: week.label,
          totalHours: totalHours.toFixed(1),
          workingDays,
          avgHours: avg,
          status: "approved",
        };
      })
      .filter((d) => parseFloat(d.totalHours) > 0); // filter empty weeks
  }, [monthlyWeeks, timeEntries]);

  const yearlyData = useMemo(() => {
    return periodDates
      .map((monthStart) => {
        const monthEnd = endOfMonth(monthStart);
        const monthEntries = timeEntries.filter((e) => {
          const ed = new Date(e.date);
          return ed >= monthStart && ed <= monthEnd;
        });
        const totalHours = monthEntries.reduce(
          (sum, e) => sum + (e.hoursWorked || 0),
          0
        );
        const workingDays = new Set(
          monthEntries.map((e) => format(new Date(e.date), "yyyy-MM-dd"))
        ).size;
        const avg =
          workingDays > 0 ? (totalHours / workingDays).toFixed(1) : "0.0";
        return {
          month: format(monthStart, "MMM"),
          totalHours: totalHours.toFixed(1),
          workingDays,
          avgHours: avg,
          status: "approved",
        };
      })
      .filter((d) => parseFloat(d.totalHours) > 0);
  }, [periodDates, timeEntries]);

  if (!currentEmployee)
    return (
      <div className="min-h-screen flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );

  const renderWeekly = () => (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[150px]">
              Employee
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Day
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Check-in
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Check-out
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Break (hrs)
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {weeklyData.map((row, i) => (
            <tr key={i}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 w-[150px]">
                {currentEmployee.name || "Abhuzzaman"}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {format(row.date, "MMM dd, yyyy")}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {row.day}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {row.checkIn}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {row.checkOut}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {typeof row.breakHours === "number"
                  ? row.breakHours.toFixed(2)
                  : row.breakHours}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <span
                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    row.status === "approved"
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {row.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderSummary = (data, periodLabel) => {
    const periodKey = viewMode === "month" ? "week" : "month";
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[150px]">
                Employee
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {periodLabel}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Hours
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Working days
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Avg Hours/Day
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((row, i) => (
              <tr key={i}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 w-[150px]">
                  {currentEmployee.name || "Abhuzzaman"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {row[periodKey]}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {row.totalHours}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {row.workingDays}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {row.avgHours}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                    {row.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 px-4">
      <Tabs
        value={viewMode}
        onValueChange={setViewMode}
        className="w-full mb-4"
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="week">Weekly</TabsTrigger>
          <TabsTrigger value="month">Monthly</TabsTrigger>
          <TabsTrigger value="year">Yearly</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="flex justify-between items-center mb-4">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-auto justify-start text-left font-medium"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {periodLabel}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={currentPeriodStart}
              onSelect={(d) => {
                if (!d) return;
                setCurrentPeriodStart(
                  viewMode === "week"
                    ? startOfWeek(d, { weekStartsOn: 1 })
                    : viewMode === "month"
                    ? startOfMonth(d)
                    : startOfYear(d)
                );
              }}
            />
          </PopoverContent>
        </Popover>
      </div>

      <Card className="p-6 shadow-lg rounded-lg">
        {isLoadingTimeEntries ? (
          <div className="flex justify-center items-center py-4">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {viewMode === "week" && renderWeekly()}
            {viewMode === "month" && renderSummary(monthlyData, "Week")}
            {viewMode === "year" && renderSummary(yearlyData, "Month")}
          </>
        )}
      </Card>
    </div>
  );
}
