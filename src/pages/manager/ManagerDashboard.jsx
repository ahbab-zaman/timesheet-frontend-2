import React, { useState, useEffect, useMemo } from "react";
import {
  format,
  startOfWeek,
  endOfWeek,
  endOfMonth,
  startOfMonth,
} from "date-fns";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import axiosInstance from "../../services/axiosInstance";
import { toast } from "sonner";

const ManagerDashboard = () => {
  const [activeTab, setActiveTab] = useState("daily");
  const [timesheets, setTimesheets] = useState([]);
  const [timesheetsLoading, setTimesheetsLoading] = useState(true);
  const [holidays, setHolidays] = useState([]);
  const [holidaysLoading, setHolidaysLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(
    format(new Date(), "yyyy-MM")
  );

  const refreshTimesheets = async () => {
    setTimesheetsLoading(true);
    try {
      const response = await axiosInstance.get("/api/v1/time/timesheets/all", {
        params: {
          status: "all",
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
      setTimesheetsLoading(false);
    }
  };

  useEffect(() => {
    refreshTimesheets();
  }, []);

  useEffect(() => {
    const fetchHolidays = async () => {
      setHolidaysLoading(true);
      try {
        const response = await axiosInstance.get("/api/v1/holiday");
        if (response.data.success) {
          const validHolidays = response.data.data.filter(
            (holiday) => holiday && holiday.id && holiday.start_date
          );
          setHolidays(validHolidays);
        }
      } catch (error) {
        console.error("Error fetching holidays:", error);
      } finally {
        setHolidaysLoading(false);
      }
    };
    fetchHolidays();
  }, []);

  const availableMonths = useMemo(() => {
    const monthsSet = new Set();
    timesheets.forEach((t) => {
      (t.entries || []).forEach((entry) => {
        if (entry.date) {
          const month = format(new Date(entry.date), "yyyy-MM");
          monthsSet.add(month);
        }
      });
    });
    return Array.from(monthsSet).sort((a, b) => b.localeCompare(a));
  }, [timesheets]);

  useEffect(() => {
    if (
      availableMonths.length > 0 &&
      !availableMonths.includes(selectedMonth)
    ) {
      setSelectedMonth(availableMonths[0]);
    }
  }, [availableMonths, selectedMonth]);

  const getAggregatedData = () => {
    if (timesheetsLoading) return [];

    let filterStart, filterEnd;
    if (activeTab === "daily") {
      const now = new Date();
      filterStart = format(now, "yyyy-MM-dd");
      filterEnd = filterStart;
    } else if (activeTab === "weekly") {
      const now = new Date();
      const weekStart = startOfWeek(now, { weekStartsOn: 1 });
      const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
      filterStart = format(weekStart, "yyyy-MM-dd");
      filterEnd = format(weekEnd, "yyyy-MM-dd");
    } else if (activeTab === "monthly") {
      const monthDate = new Date(selectedMonth + "-01");
      filterStart = format(monthDate, "yyyy-MM-dd");
      const monthEnd = endOfMonth(monthDate);
      filterEnd = format(monthEnd, "yyyy-MM-dd");
    }

    let filteredEntries = timesheets.flatMap((t) =>
      (t.entries || [])
        .filter((entry) => {
          if (!entry.date) return false;
          const entryDateStr = format(new Date(entry.date), "yyyy-MM-dd");
          return entryDateStr >= filterStart && entryDateStr <= filterEnd;
        })
        .map((entry) => ({
          ...entry,
          employeeName: t.employees?.name || "Unknown",
        }))
    );

    const aggregatedData = filteredEntries.reduce((acc, entry) => {
      const employeeName = entry.employeeName || "Unknown";
      acc[employeeName] = (acc[employeeName] || 0) + (Number(entry.hours) || 0);
      return acc;
    }, {});

    return Object.entries(aggregatedData).map(([label, hours]) => ({
      label: label.length > 12 ? `${label.substring(0, 12)}...` : label,
      hours: parseFloat(hours.toFixed(1)),
    }));
  };

  const data = getAggregatedData();
  const maxHours = data.length > 0 ? Math.max(...data.map((d) => d.hours)) : 1;
  const barHeight = 120;

  const getPeriodText = useMemo(() => {
    switch (activeTab) {
      case "daily":
        return format(new Date(), "MMM dd, yyyy");
      case "weekly":
        const now = new Date();
        const ws = startOfWeek(now, { weekStartsOn: 1 });
        const we = endOfWeek(now, { weekStartsOn: 1 });
        return `${format(ws, "MMM dd")} - ${format(we, "MMM dd, yyyy")}`;
      case "monthly":
        if (selectedMonth) {
          return format(new Date(selectedMonth + "-01"), "MMMM yyyy");
        }
        return "";
      default:
        return "";
    }
  }, [activeTab, selectedMonth]);

  const todayDate = new Date().toISOString().split("T")[0];
  const upcomingHolidays = holidays
    .filter((h) => h.start_date >= todayDate)
    .sort((a, b) => new Date(a.start_date) - new Date(b.start_date));

  const formatHolidayDates = (holiday) => {
    if (!holiday || !holiday.start_date) {
      return "No date available";
    }
    const start = new Date(holiday.start_date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    if (holiday.end_date) {
      const end = new Date(holiday.end_date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
      return `${start} - ${end}`;
    }
    return start;
  };

  const Spinner = () => (
    <svg
      className="animate-spin h-4 w-4 mr-2 text-primary"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
  );

  const renderBarChart = () => {
    if (timesheetsLoading) {
      return (
        <div className="flex justify-center items-center py-12">
          <Spinner />
          <span className="ml-2">Loading timesheets...</span>
        </div>
      );
    }
    if (data.length === 0) {
      return (
        <div className="text-gray-500">
          No data available for this {activeTab}
        </div>
      );
    }
    return (
      <div className="flex justify-around items-end h-[140px] mb-3 overflow-x-auto px-4">
        {data.map((item, index) => (
          <div
            key={index}
            className="flex flex-col items-center flex-shrink-0 mx-2 min-w-[70px]"
          >
            <div
              className="bg-green-500 rounded-t-md w-8"
              style={{
                height: `${(item.hours / maxHours) * barHeight}px`,
              }}
            />
            <div className="text-xs font-bold text-gray-700 mt-2">
              {item.hours}
            </div>
            <div className="text-xs text-gray-500 mt-1 truncate w-20 text-center">
              {item.label}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderMonthlySelector = () => {
    if (activeTab !== "monthly") return null;
    return (
      <div className="mb-4 flex justify-center">
        <label className="text-sm text-gray-600 mr-2">Select Month:</label>
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-1"
        >
          {availableMonths.map((m) => (
            <option key={m} value={m}>
              {format(new Date(m + "-01"), "MMMM yyyy")}
            </option>
          ))}
        </select>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Bar */}
      <div className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center shadow-sm">
        <div className="flex space-x-2">
          <button
            className={`px-4 py-2 border rounded-full ${
              activeTab === "daily"
                ? "border-blue-500 bg-blue-500 text-white"
                : "border-gray-300 bg-white hover:bg-gray-50"
            }`}
            onClick={() => setActiveTab("daily")}
          >
            Daily
          </button>
          <button
            className={`px-4 py-2 border rounded-full ${
              activeTab === "weekly"
                ? "border-blue-500 bg-blue-500 text-white"
                : "border-gray-300 bg-white hover:bg-gray-50"
            }`}
            onClick={() => setActiveTab("weekly")}
          >
            Weekly
          </button>
          <button
            className={`px-4 py-2 border rounded-full ${
              activeTab === "monthly"
                ? "border-blue-500 bg-blue-500 text-white"
                : "border-gray-300 bg-white hover:bg-gray-50"
            }`}
            onClick={() => setActiveTab("monthly")}
          >
            Monthly
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-flow-col p-8 max-w-7xl mx-auto space-x-8">
        {/* Greeting Section */}
        <div className="grid-cols-7 bg-white rounded-xl p-8 shadow-sm">
          <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6 text-blue-500 text-4xl">
            👋
          </div>
          <div className="text-center">
            {renderMonthlySelector()}
            <div className="text-sm text-gray-600 mb-3">
              Tracked hours ({activeTab}) for {getPeriodText}
            </div>
            {renderBarChart()}
          </div>
        </div>

        {/* Upcoming Holidays */}
        <div className="grid-cols-5 bg-white rounded-xl p-6 shadow-sm">
          <div className="text-lg font-medium mb-4 text-center">
            UPCOMING HOLIDAYS
          </div>
          {holidaysLoading ? (
            <div className="flex justify-center items-center py-4">
              <Spinner />
            </div>
          ) : upcomingHolidays.length === 0 ? (
            <div className="text-red-500 font-bold text-center">
              No upcoming holidays
            </div>
          ) : (
            <ul className="space-y-3 max-h-80 overflow-y-auto">
              {upcomingHolidays.map((holiday) => (
                <li
                  key={holiday.id}
                  className="text-sm border-b border-gray-100 pb-2"
                >
                  <div className="font-medium text-gray-900">
                    {holiday.name}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {formatHolidayDates(holiday)}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;
