import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  LogOut,
  Settings,
  User,
  MoreHorizontal,
  Briefcase,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useDispatch } from "react-redux";
import { logout } from "@/redux/features/auth/authSlice";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useState } from "react";
import axiosInstance from "@/services/axiosInstance";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin } from "lucide-react";
import { motion } from "framer-motion";

const COLORS = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf3",
  "#ec4899",
  "#14b8a6",
  "#f97316",
];

const EmployeeMain = () => {
  const [employee, setEmployee] = useState(null);
  const [holidays, setHolidays] = useState([]);
  const [upcomingHolidays, setUpcomingHolidays] = useState([]);
  const [timeEntries, setTimeEntries] = useState([]);
  const [employeeProjects, setEmployeeProjects] = useState([]);
  const [projectTimeData, setProjectTimeData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState("week");
  const [isLoadingTimeEntries, setIsLoadingTimeEntries] = useState(false);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);
  const [isHoveredHolidays, setIsHoveredHolidays] = useState(false);
  const [hoveredProject, setHoveredProject] = useState(null);
  const [currentDateRange, setCurrentDateRange] = useState({
    start: null,
    end: null,
  });
  // 🆕 CHANGE 1: Added leaves state to store employee's leave data
  const [leaves, setLeaves] = useState([]);

  // Fetch current employee
  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const response = await axiosInstance.get("/api/v1/employee/me");
        setEmployee(response.data.employee || response.data.user);
      } catch (error) {
        console.error("Failed to fetch employee:", error);
        toast.error("Failed to load profile");
      }
    };
    fetchEmployee();
  }, []);

  // Fetch employee's assigned projects
  useEffect(() => {
    const fetchEmployeeProjects = async () => {
      if (!employee) return;

      setIsLoadingProjects(true);
      try {
        const response = await axiosInstance.get(
          "/api/v1/task/employee/projects"
        );
        setEmployeeProjects(response.data.projects || []);
      } catch (error) {
        console.error("Failed to fetch employee projects:", error);
        toast.error("Failed to load your projects");
      } finally {
        setIsLoadingProjects(false);
      }
    };
    fetchEmployeeProjects();
  }, [employee]);

  // Fetch holidays and filter upcoming
  useEffect(() => {
    const fetchHolidays = async () => {
      try {
        const response = await axiosInstance.get("/api/v1/holiday");
        const allHolidays = response.data.data || [];
        const now = new Date();
        const upcoming = allHolidays
          .filter((h) => new Date(h.start_date) > now)
          .sort((a, b) => new Date(a.start_date) - new Date(b.start_date))
          .slice(0, 5);
        setHolidays(allHolidays);
        setUpcomingHolidays(upcoming);
      } catch (error) {
        console.error("Failed to fetch holidays:", error);
        toast.error("Failed to load holidays");
      }
    };
    fetchHolidays();
  }, []);

  // 🆕 CHANGE 2: Added useEffect to fetch employee's leaves from backend
  useEffect(() => {
    const fetchLeaves = async () => {
      if (!employee?.id) return;

      try {
        const response = await axiosInstance.get("/api/v1/leave", {
          params: {
            createdBy: employee.id,
            limit: 100, // Get more leaves to cover the date range
          },
        });
        setLeaves(response.data.leaves || []);
      } catch (error) {
        console.error("Failed to fetch leaves:", error);
        toast.error("Failed to load leave data");
      }
    };
    fetchLeaves();
  }, [employee?.id]);

  // Fetch time entries based on view
  const fetchTimeEntries = async (startDate, endDate, employeeId) => {
    if (!employeeId) {
      toast.error("Employee ID not available. Please log in again.");
      return;
    }
    setIsLoadingTimeEntries(true);
    try {
      const response = await axiosInstance.get("/api/v1/time/timesheets/week", {
        params: {
          employee_id: employeeId,
          week_start: startDate,
          week_end: endDate,
        },
      });
      const newEntries = response.data.timeEntries || [];
      if (!Array.isArray(newEntries)) {
        setTimeEntries([]);
        return;
      }
      setTimeEntries(newEntries);

      // Calculate project time distribution
      calculateProjectTime(newEntries);
    } catch (error) {
      console.error("Failed to fetch time entries:", error.response || error);
      toast.error(`Failed to load time entries: ${error.message}`);
      setTimeEntries([]);
    } finally {
      setIsLoadingTimeEntries(false);
    }
  };

  // Calculate time spent on each project
  const calculateProjectTime = (entries) => {
    const projectTimeMap = {};

    entries.forEach((entry) => {
      const project = entry.project || entry.task?.project;
      if (!project) return;

      const projectId = project.id;
      const projectName = project.name || "Unnamed Project";
      const hours = parseFloat(entry.hours || 0);

      if (!projectTimeMap[projectId]) {
        projectTimeMap[projectId] = {
          id: projectId,
          name: projectName,
          hours: 0,
        };
      }

      projectTimeMap[projectId].hours += hours;
    });

    const projectData = Object.values(projectTimeMap).map((project) => ({
      name: project.name,
      hours: parseFloat(project.hours.toFixed(2)),
    }));

    setProjectTimeData(projectData);
  };

  // Check if a date falls within a holiday period
  const isDateOnHoliday = (dateStr) => {
    const date = new Date(dateStr);
    return holidays.find((holiday) => {
      const startDate = new Date(holiday.start_date);
      const endDate = holiday.end_date ? new Date(holiday.end_date) : startDate;
      return date >= startDate && date <= endDate;
    });
  };

  // 🆕 CHANGE 3: Added function to check if a date has an approved leave
  const isDateOnLeave = (dateStr) => {
    const date = new Date(dateStr);
    return leaves.find((leave) => {
      if (leave.status !== "Approved") return false;

      const fromDate = new Date(leave.fromDate);
      const toDate = leave.toDate ? new Date(leave.toDate) : fromDate;
      return date >= fromDate && date <= toDate;
    });
  };

  // 🆕 CHANGE 4: Updated prepareChartData to include leave information
  const prepareChartData = (entries) => {
    if (!currentDateRange.start || !currentDateRange.end) return [];

    const startDate = new Date(currentDateRange.start);
    const endDate = new Date(currentDateRange.end);

    // Create map of existing time entries by date
    const entriesMap = {};
    entries.forEach((entry) => {
      const date = new Date(entry.date || entry.date_time);
      const dateKey = date.toISOString().split("T")[0];
      if (!entriesMap[dateKey]) {
        entriesMap[dateKey] = 0;
      }
      entriesMap[dateKey] += parseFloat(entry.hours || entry.duration || 0);
    });

    // Generate all dates in range
    const chartData = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const dateKey = currentDate.toISOString().split("T")[0];
      const dayName = currentDate.toLocaleDateString("en-US", {
        weekday: "short",
      });

      const workedHours = entriesMap[dateKey] || 0;
      const holiday = isDateOnHoliday(dateKey);
      const leave = isDateOnLeave(dateKey);

      // Assume 8 hours standard work day for holiday/leave display
      const holidayHours = holiday && workedHours === 0 ? 8 : 0;
      const leaveHours = leave && workedHours === 0 && !holiday ? 8 : 0;

      chartData.push({
        day:
          view === "month"
            ? currentDate.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })
            : dayName,
        hours: workedHours,
        holidayHours: holidayHours,
        leaveHours: leaveHours, // 🆕 Added leaveHours
        date: dateKey,
        holidayName: holiday ? holiday.name : null,
        leaveName: leave ? `${leave.leaveType}` : null, // 🆕 Added leaveName
        leaveReason: leave ? leave.reason : null, // 🆕 Added leaveReason
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return chartData;
  };

  const chartData = prepareChartData(timeEntries);

  // Calculate week or month range based on view
  useEffect(() => {
    if (!employee?.id) return;

    const today = new Date();
    let startDate, endDate;

    if (view === "week") {
      const day = today.getDay();
      startDate = new Date(today);
      startDate.setDate(today.getDate() - day + (day === 0 ? -6 : 1));
      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);
    } else if (view === "month") {
      startDate = new Date(today.getFullYear(), today.getMonth(), 1);
      endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    } else {
      startDate = new Date(today);
      endDate = new Date(today);
    }

    const formattedStart = startDate.toISOString().split("T")[0];
    const formattedEnd = endDate.toISOString().split("T")[0];

    setCurrentDateRange({ start: formattedStart, end: formattedEnd });
    fetchTimeEntries(formattedStart, formattedEnd, employee.id);
  }, [view, employee?.id]);

  useEffect(() => {
    if (employee && upcomingHolidays.length >= 0 && !isLoadingTimeEntries) {
      setIsLoading(false);
    }
  }, [employee, upcomingHolidays, isLoadingTimeEntries]);

  // Custom label for pie chart
  const renderCustomLabel = (entry) => {
    return `${entry.hours}h`;
  };

  // 🆕 CHANGE 5: Updated CustomTooltip to show leave information
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900 mb-1">{label}</p>
          {data.hours > 0 && (
            <p className="text-blue-600">Worked: {data.hours.toFixed(1)}h</p>
          )}
          {data.holidayHours > 0 && (
            <div className="text-amber-600">
              <p className="font-medium">Holiday: {data.holidayName}</p>
            </div>
          )}
          {data.leaveHours > 0 && (
            <div className="text-emerald-600">
              <p className="font-medium">Leave: {data.leaveName}</p>
              {data.leaveReason && (
                <p className="text-xs text-gray-600 mt-1">
                  Reason: {data.leaveReason.substring(0, 50)}
                  {data.leaveReason.length > 50 ? "..." : ""}
                </p>
              )}
            </div>
          )}
          {data.hours === 0 &&
            data.holidayHours === 0 &&
            data.leaveHours === 0 && (
              <p className="text-gray-500">No hours logged</p>
            )}
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-4 md:p-6">
      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 md:mb-6">
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <Select value={view} onValueChange={setView}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Day</SelectItem>
              <SelectItem value="week">Week</SelectItem>
              <SelectItem value="month">Month</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Greeting and Upcoming Holidays Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-4 md:mb-6">
        {/* Greeting Card */}
        <Card className="bg-white shadow-sm border-0">
          <CardHeader className="pb-3 md:pb-4">
            <CardTitle className="text-xl md:text-2xl font-semibold text-gray-900">
              Hello {employee?.name || "User"},
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs md:text-sm text-gray-500">
              Stay productive today!
            </p>
          </CardContent>
        </Card>

        {/* Upcoming Holidays Card */}
        <Card
          className="bg-gradient-to-br from-yellow-50 to-orange-50 shadow-sm border-0 relative overflow-hidden"
          onMouseEnter={() => setIsHoveredHolidays(true)}
          onMouseLeave={() => setIsHoveredHolidays(false)}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-3 md:pb-4 relative z-10">
            <CardTitle className="text-base md:text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Calendar className="h-4 w-4 md:h-5 md:w-5 text-orange-500" />
              <span className="truncate">Upcoming Holidays</span>
            </CardTitle>
            <MoreHorizontal className="h-4 w-4 text-gray-400 flex-shrink-0" />
          </CardHeader>
          <CardContent
            className={`relative z-10 transition-all duration-300 ${
              isHoveredHolidays
                ? "max-h-[300px] overflow-hidden"
                : "max-h-48 overflow-y-auto overflow-x-hidden"
            }`}
          >
            {upcomingHolidays.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6 md:py-8 text-center">
                <Calendar className="h-10 w-10 md:h-12 md:w-12 text-gray-300 mb-2" />
                <p className="text-xs md:text-sm text-gray-500 font-medium">
                  No upcoming holidays
                </p>
                <p className="text-xs text-gray-400">
                  Check back later for updates!
                </p>
              </div>
            ) : (
              <div className="space-y-3 overflow-x-hidden">
                {upcomingHolidays.map((holiday, index) => (
                  <motion.div
                    key={holiday.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02, y: -2 }}
                    className="group cursor-pointer bg-white/80 backdrop-blur-sm rounded-lg p-2 md:p-3 border-l-4 border-orange-400 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
                        <Badge
                          variant="outline"
                          className="bg-orange-100 text-orange-700 border-orange-300 flex-shrink-0 text-xs"
                        >
                          {new Date(holiday.start_date).toLocaleDateString(
                            "en-US",
                            { month: "short", day: "numeric" }
                          )}
                        </Badge>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-gray-900 text-xs md:text-sm truncate">
                            {holiday.name}
                          </p>
                          <p className="text-xs text-gray-500 flex items-center gap-1">
                            <MapPin className="h-3 w-3 flex-shrink-0" />
                            <span className="truncate">
                              {holiday.description
                                ? holiday.description.substring(0, 30) + "..."
                                : "Company-wide"}
                            </span>
                          </p>
                        </div>
                      </div>
                      {holiday.is_paid && (
                        <Badge className="bg-green-100 text-green-700 flex-shrink-0 text-xs">
                          Paid
                        </Badge>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
          <div className="absolute inset-0 bg-gradient-to-r from-orange-100/30 to-yellow-100/30" />
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-4 md:mb-6">
        {/* Current Projects Section */}
        <Card className="bg-white shadow-sm border-0">
          <CardHeader className="pb-3 md:pb-4">
            <CardTitle className="text-base md:text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Briefcase className="h-4 w-4 md:h-5 md:w-5 text-blue-600" />
              <span className="truncate">Your Current Projects</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingProjects ? (
              <div className="flex items-center justify-center py-6 md:py-8">
                <div className="text-xs md:text-sm text-gray-500">
                  Loading projects...
                </div>
              </div>
            ) : employeeProjects.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6 md:py-8 text-center">
                <Briefcase className="h-10 w-10 md:h-12 md:w-12 text-gray-300 mb-2" />
                <p className="text-xs md:text-sm text-gray-500 font-medium">
                  No projects assigned
                </p>
                <p className="text-xs text-gray-400">
                  You'll see your projects here once assigned
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 md:gap-4">
                {employeeProjects.map((project, index) => (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-3 md:p-4 border border-gray-200 rounded-lg bg-gradient-to-br from-blue-50 to-white hover:shadow-md transition-all duration-200 cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-800 text-xs md:text-sm truncate flex-1 pr-2">
                        {project.name}
                      </h3>
                    </div>
                    <Badge
                      className={`${
                        project.project_type === "billable"
                          ? "bg-green-100 text-green-800 border-green-300"
                          : "bg-gray-100 text-gray-800 border-gray-300"
                      } text-xs`}
                      variant="outline"
                    >
                      {project.project_type || "billable"}
                    </Badge>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Project Time Distribution Section */}
        <Card className="bg-white shadow-sm border-0">
          <CardHeader className="pb-3 md:pb-4">
            <CardTitle className="text-base md:text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Clock className="h-4 w-4 md:h-5 md:w-5 text-purple-600" />
              <span className="truncate">Time Distribution by Project</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingTimeEntries ? (
              <div className="flex items-center justify-center py-6 md:py-8">
                <div className="text-xs md:text-sm text-gray-500">
                  Loading data...
                </div>
              </div>
            ) : projectTimeData.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6 md:py-8 text-center">
                <Clock className="h-10 w-10 md:h-12 md:w-12 text-gray-300 mb-2" />
                <p className="text-xs md:text-sm text-gray-500 font-medium">
                  No time tracked yet
                </p>
                <p className="text-xs text-gray-400">
                  Start tracking time to see distribution
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-4 md:gap-6">
                {/* Pie Chart */}
                <div className="flex items-center justify-center">
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={projectTimeData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={renderCustomLabel}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="hours"
                        onMouseEnter={(_, index) => setHoveredProject(index)}
                        onMouseLeave={() => setHoveredProject(null)}
                      >
                        {projectTimeData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                            opacity={
                              hoveredProject === null ||
                              hoveredProject === index
                                ? 1
                                : 0.3
                            }
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value) => [`${value} hours`, "Total Time"]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Legend with Details */}
                <div className="flex flex-col space-y-2 md:space-y-3">
                  <h3 className="font-semibold text-gray-900 text-sm md:text-base mb-1 md:mb-2">
                    Project Breakdown
                  </h3>
                  {projectTimeData.map((project, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      onMouseEnter={() => setHoveredProject(index)}
                      onMouseLeave={() => setHoveredProject(null)}
                      className={`flex items-center justify-between p-2 md:p-3 rounded-lg border transition-all duration-200 cursor-pointer ${
                        hoveredProject === index
                          ? "bg-gray-50 border-gray-300 shadow-sm"
                          : "bg-white border-gray-200"
                      }`}
                    >
                      <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
                        <div
                          className="w-3 h-3 md:w-4 md:h-4 rounded-full flex-shrink-0"
                          style={{
                            backgroundColor: COLORS[index % COLORS.length],
                          }}
                        />
                        <span className="text-xs md:text-sm font-medium text-gray-900 truncate">
                          {project.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
                        <Badge
                          variant="secondary"
                          className="font-semibold text-xs"
                        >
                          {project.hours}h
                        </Badge>
                        <span className="text-xs text-gray-500 hidden sm:inline">
                          (
                          {(
                            (project.hours /
                              projectTimeData.reduce(
                                (sum, p) => sum + p.hours,
                                0
                              )) *
                            100
                          ).toFixed(1)}
                          %)
                        </span>
                      </div>
                    </motion.div>
                  ))}

                  {/* Total */}
                  <div className="mt-2 md:mt-4 pt-2 md:pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-gray-900 text-sm md:text-base">
                        Total Time
                      </span>
                      <Badge className="bg-blue-600 text-white font-bold text-xs md:text-sm">
                        {projectTimeData
                          .reduce((sum, p) => sum + p.hours, 0)
                          .toFixed(2)}
                        h
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tracked Hours Card with Bar Chart */}
      <Card className="bg-white shadow-sm border-0">
        <CardHeader className="pb-3 md:pb-4">
          <CardTitle className="text-base md:text-lg font-semibold text-gray-900">
            Tracked Hours ({view.charAt(0).toUpperCase() + view.slice(1)})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingTimeEntries ? (
            <div className="flex items-center justify-center py-6 md:py-8">
              <div className="text-xs md:text-sm text-gray-500">
                Loading tracked hours...
              </div>
            </div>
          ) : chartData.length === 0 ? (
            <div className="flex items-center justify-center py-6 md:py-8 text-gray-500">
              <p className="text-xs md:text-sm">
                No tracked hours for this {view}
              </p>
            </div>
          ) : (
            <div className="space-y-4 md:space-y-6">
              {/* 🆕 CHANGE 6: Updated Summary Stats to show Leave Days instead of Leave Hours */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4 mb-4 md:mb-6">
                <div className="text-center p-3 md:p-0">
                  <div className="text-xl md:text-2xl font-bold text-blue-600">
                    {chartData
                      .reduce(
                        (sum, entry) => sum + parseFloat(entry.hours || 0),
                        0
                      )
                      .toFixed(1)}
                  </div>
                  <p className="text-xs text-gray-500">Worked</p>
                </div>
                <div className="text-center p-3 md:p-0">
                  <div className="text-xl md:text-2xl font-bold text-amber-600">
                    {chartData.filter((d) => d.holidayHours > 0).length}
                  </div>
                  <p className="text-xs text-gray-500">Holidays</p>
                </div>
                <div className="text-center p-3 md:p-0">
                  <div className="text-xl md:text-2xl font-bold text-emerald-600">
                    {chartData.filter((d) => d.leaveHours > 0).length}
                  </div>
                  <p className="text-xs text-gray-500">Leave Days</p>
                </div>
                <div className="text-center p-3 md:p-0">
                  <div className="text-xl md:text-2xl font-bold text-green-600">
                    {(
                      chartData.reduce(
                        (sum, entry) => sum + parseFloat(entry.hours || 0),
                        0
                      ) +
                      chartData.reduce(
                        (sum, entry) =>
                          sum + parseFloat(entry.holidayHours || 0),
                        0
                      ) +
                      chartData.reduce(
                        (sum, entry) => sum + parseFloat(entry.leaveHours || 0),
                        0
                      )
                    ).toFixed(1)}
                  </div>
                  <p className="text-xs text-gray-500">Total</p>
                </div>
              </div>

              {/* 🆕 CHANGE 7: Updated Bar Chart to include separate Leave bar */}
              <ResponsiveContainer
                width="100%"
                height={250}
                className="md:h-[300px]"
              >
                <BarChart
                  data={chartData}
                  margin={{ top: 10, right: 10, left: -10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="day"
                    tick={{ fontSize: 10 }}
                    className="md:text-xs"
                  />
                  <YAxis
                    tickFormatter={(value) => `${value}h`}
                    tick={{ fontSize: 10 }}
                    className="md:text-xs"
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: "12px" }} />
                  <Bar
                    dataKey="hours"
                    fill="#3b82f6"
                    name="Worked Hours"
                    radius={[4, 4, 0, 0]}
                    stackId="a"
                  />
                  <Bar
                    dataKey="leaveHours"
                    fill="#10b981"
                    name="Leave"
                    radius={[4, 4, 0, 0]}
                    stackId="a"
                  />
                  <Bar
                    dataKey="holidayHours"
                    fill="#f59e0b"
                    name="Holiday"
                    radius={[4, 4, 0, 0]}
                    stackId="a"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EmployeeMain;
