import { useState, useEffect, useMemo } from "react";
import { format, addDays, startOfWeek, endOfWeek, parse } from "date-fns";
import {
  CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Filter,
  Search,
  Loader2,
  ArrowLeft,
  Clock,
  ChevronDown,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import TimeTracker from "./TimeTracker";
import EmployeeNotification from "./EmployeeNotification";
import { useDispatch } from "react-redux";
import { logout } from "@/redux/features/auth/authSlice";
import axiosInstance from "../../services/axiosInstance";
import { Link } from "react-router-dom";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import EmployeeLeave from "./EmployeeLeave";

const formatTime = (totalSeconds) => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const parts = [];
  if (hours > 0) parts.push(`${hours} hr${hours !== 1 ? "s" : ""}`);
  if (minutes > 0) parts.push(`${minutes} min${minutes !== 1 ? "s" : ""}`);
  if (seconds > 0) parts.push(`${seconds} sec${seconds !== 1 ? "s" : ""}`);
  return parts.length > 0 ? parts.join(" ") : "0 sec";
};

export default function EmployeeDashboard() {
  const [currentWeekStart, setCurrentWeekStart] = useState(
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );
  const [isLoadingTimeEntries, setIsLoadingTimeEntries] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState(null);
  const [allProjects, setAllProjects] = useState([]);
  const [approvedLeaves, setApprovedLeaves] = useState([]);
  const [timeEntries, setTimeEntries] = useState([]);
  const [isTimesheetOpen, setIsTimesheetOpen] = useState(false);
  const [manualEntry, setManualEntry] = useState({
    project: "",
    task: "",
    description: "",
    hours: "",
    date: format(new Date(), "yyyy-MM-dd"),
  });
  const [manualEntryDialogOpen, setManualEntryDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [projectTypeFilter, setProjectTypeFilter] = useState("all");
  const dispatch = useDispatch();

  const weekDates = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i)),
    [currentWeekStart]
  );

  useEffect(() => {
    let isMounted = true;
    const fetchCurrentEmployee = async () => {
      try {
        const response = await axiosInstance.get("/api/v1/employee/me");
        if (isMounted) {
          const employee = response.data.employee;
          console.log("Current employee", employee);
          setCurrentEmployee(employee);
        }
      } catch (error) {
        if (isMounted) {
          toast.error("Failed to fetch employee details. Please try again.");
          console.error("Error fetching current employee:", error);
        }
      }
    };
    fetchCurrentEmployee();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    const fetchProjects = async () => {
      try {
        const response = await axiosInstance.get("/api/v1/project");
        if (isMounted) {
          setAllProjects(response.data.projects || []);
        }
      } catch (error) {
        if (isMounted) {
          toast.error("Failed to fetch projects. Please try again.");
          console.error("Error fetching projects:", error);
        }
      }
    };
    fetchProjects();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (currentEmployee) {
      fetchLeaves();
    }
  }, [currentEmployee]);

  const fetchLeaves = async () => {
    if (!currentEmployee) return;
    let isMounted = true;
    try {
      const response = await axiosInstance.get("/api/v1/leave/", {
        params: {
          createdBy: currentEmployee.id,
        },
      });
      if (isMounted) {
        const leaves = response.data.leaves || [];
        console.log(leaves);
        const approved = leaves.filter((leave) => leave.status === "Approved");
        setApprovedLeaves(approved);
        console.log("Approved leaves", approved);
      }
    } catch (error) {
      if (isMounted) {
        toast.error("Failed to fetch leaves. Please try again.");
        console.error("Error fetching leaves:", error);
      }
    } finally {
      if (isMounted) {
        // No loading state for leaves in dashboard
      }
    }
  };

  const weekApprovedLeaves = useMemo(() => {
    const weekStartDate = currentWeekStart;
    const weekEndDate = endOfWeek(currentWeekStart, { weekStartsOn: 1 });
    return approvedLeaves.filter((leave) => {
      const leaveStart = parse(leave.fromDate, "yyyy-MM-dd", new Date());
      const leaveEnd = parse(
        leave.toDate || leave.fromDate,
        "yyyy-MM-dd",
        new Date()
      );
      return leaveEnd >= weekStartDate && leaveStart <= weekEndDate;
    });
  }, [approvedLeaves, currentWeekStart]);

  const fetchTimeEntries = async (weekStart, weekEnd, employeeId) => {
    if (!employeeId) {
      toast.error("Employee ID not available. Please log in again.");
      return;
    }
    setIsLoadingTimeEntries(true);
    try {
      const response = await axiosInstance.get("/api/v1/time/timesheets/week", {
        params: {
          employee_id: employeeId,
          week_start: weekStart,
          week_end: weekEnd,
        },
      });
      const newEntries = response.data.timeEntries || [];
      console.log(newEntries);
      if (!Array.isArray(newEntries)) {
        setTimeEntries([]);
        return;
      }
      if (newEntries.length === 0) {
        console.log("No time entries found for the given week.");
      } else {
        console.log("Processed time entries:", newEntries);
      }
      setTimeEntries(newEntries);
    } catch (error) {
      console.error("Failed to fetch time entries:", error.response || error);
      toast.error(`Failed to load time entries: ${error.message}`);
      setTimeEntries([]);
    } finally {
      setIsLoadingTimeEntries(false);
    }
  };

  const refreshTimeEntries = () => {
    if (currentEmployee?.id) {
      const weekStart = format(currentWeekStart, "yyyy-MM-dd");
      const weekEnd = format(
        endOfWeek(currentWeekStart, { weekStartsOn: 1 }),
        "yyyy-MM-dd"
      );
      fetchTimeEntries(weekStart, weekEnd, currentEmployee.id);
    }
  };

  useEffect(() => {
    if (currentEmployee?.id) {
      const weekStart = format(currentWeekStart, "yyyy-MM-dd");
      const weekEnd = format(
        endOfWeek(currentWeekStart, { weekStartsOn: 1 }),
        "yyyy-MM-dd"
      );
      fetchTimeEntries(weekStart, weekEnd, currentEmployee.id);
    }
  }, [currentEmployee, currentWeekStart]);

  const groupedProjects = useMemo(() => {
    const projectMap = new Map();

    // Initialize with all projects
    allProjects.forEach((proj) => {
      if (!proj.id) return;
      projectMap.set(proj.id, {
        id: proj.id,
        name: proj.name || "Unnamed Project",
        project_type: proj.project_type || "billable",
        dailyHours: new Array(7).fill(0),
      });
    });

    // Add hours from time entries
    timeEntries.forEach((entry) => {
      const project = entry.project || entry.task?.project;
      if (!project || !project.id) return;

      const projectId = project.id;
      if (!projectMap.has(projectId)) {
        // Fallback if project not in allProjects
        projectMap.set(projectId, {
          id: projectId,
          name: project.name || "Unnamed Project",
          project_type: project.project_type || "billable",
          dailyHours: new Array(7).fill(0),
        });
      }

      const projData = projectMap.get(projectId);
      const entryHours = Number(entry.hours);
      const entryDate = entry.date;
      const weekDateStrs = weekDates.map((date) => format(date, "yyyy-MM-dd"));
      const dayIndex = weekDateStrs.indexOf(entryDate);

      if (dayIndex !== -1) {
        projData.dailyHours[dayIndex] += entryHours;
      }
    });

    return Array.from(projectMap.values());
  }, [timeEntries, weekDates, allProjects]);

  const filteredProjects = useMemo(() => {
    if (projectTypeFilter === "all") return groupedProjects;
    return groupedProjects.filter(
      (proj) => proj.project_type === projectTypeFilter
    );
  }, [groupedProjects, projectTypeFilter]);

  const handlePreviousWeek = () => {
    setCurrentWeekStart((prev) => addDays(prev, -7));
  };

  const handleNextWeek = () => {
    setCurrentWeekStart((prev) => addDays(prev, 7));
  };

  const handleDateSelect = (date) => {
    if (date) {
      setCurrentWeekStart(startOfWeek(date, { weekStartsOn: 1 }));
    }
  };

  const handleManualEntrySubmit = async () => {
    if (!manualEntry.project || !manualEntry.task || !manualEntry.hours) {
      toast.error("Please fill all required fields.");
      return;
    }
    setIsSubmitting(true);
    try {
      const entryData = {
        employee_id: currentEmployee.id,
        project: manualEntry.project,
        task: manualEntry.task,
        description: manualEntry.description,
        hours: parseFloat(manualEntry.hours),
        date: manualEntry.date,
      };
      const response = await axiosInstance.post(
        "/api/v1/time/timesheets",
        entryData
      );
      toast.success("Manual entry added successfully");
      setManualEntryDialogOpen(false);
      setManualEntry({
        project: "",
        task: "",
        description: "",
        hours: "",
        date: format(new Date(), "yyyy-MM-dd"),
      });
      refreshTimeEntries();
    } catch (error) {
      toast.error("Failed to add manual entry. Please try again.");
      console.error("Error adding manual entry:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // submit timesheet

  const submitTimesheet = () => {
    toast.success("Timesheet successfully submit");
  };

  const calculateTotalDailyHours = useMemo(() => {
    const totals = new Array(7).fill(0);
    filteredProjects.forEach((proj) => {
      proj.dailyHours.forEach((hours, i) => {
        totals[i] += hours;
      });
    });
    return totals;
  }, [filteredProjects]);

  const getLeaveForDate = (date) => {
    return weekApprovedLeaves.find((leave) => {
      const leaveStart = parse(leave.fromDate, "yyyy-MM-dd", new Date());
      const leaveEnd = parse(
        leave.toDate || leave.fromDate,
        "yyyy-MM-dd",
        new Date()
      );
      return date >= leaveStart && date <= leaveEnd;
    });
  };

  const getLeaveInitial = (leaveType) => {
    if (!leaveType) return "L";
    const words = leaveType.split(" ");
    return words
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase();
  };

  if (!currentEmployee) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground mt-2">Loading employee data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 px-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center"></div>
      <div className="">
        <div></div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex space-x-2">
              <Button variant="ghost" size="sm" onClick={handlePreviousWeek}>
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous Week
              </Button>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-64 justify-start text-left"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(weekDates[0], "MMM dd")} -{" "}
                    {format(weekDates[6], "dd, yyyy")}
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
              <Button variant="ghost" size="sm" onClick={handleNextWeek}>
                Next Week
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
            <Select
              value={projectTypeFilter}
              onValueChange={setProjectTypeFilter}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Projects</SelectItem>
                <SelectItem value="billable">Billable</SelectItem>
                <SelectItem value="non-billable">Non-Billable</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Card className="p-6 shadow-lg rounded-lg">
            {isLoadingTimeEntries ? (
              <div className="flex justify-center items-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : (
              <>
                {/* Day Headers */}
                <div className="grid grid-cols-8 gap-0 bg-blue-50 p-2 rounded-t-md mb-0">
                  <div className="col-span-1"></div>
                  {weekDates.map((date, i) => (
                    <div
                      key={date.toISOString()}
                      className="text-center text-sm font-medium text-gray-700"
                    >
                      {format(date, "EEE dd")}
                    </div>
                  ))}
                </div>

                {/* Absence Section */}
                <div className="grid grid-cols-8 gap-0 border-b border-gray-200">
                  <div className="col-span-1 p-3 pl-4 font-medium text-gray-800">
                    <span className="flex items-center gap-2">
                      <ChevronDown /> Absence
                    </span>
                  </div>
                  {weekDates.map((date) => {
                    const coveringLeave = getLeaveForDate(date);
                    return (
                      <div
                        key={date.toISOString()}
                        className="p-2 border-l border-gray-200 text-center text-sm text-muted-foreground min-h-[80px] flex items-center justify-center"
                      >
                        {coveringLeave ? (
                          <span
                            className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-medium"
                            title={coveringLeave.leaveType || "Leave"}
                          >
                            {getLeaveInitial(coveringLeave.leaveType)}
                          </span>
                        ) : (
                          "-"
                        )}
                      </div>
                    );
                  })}
                </div>
                <div className="bg-gray-50 p-4 border-b border-gray-200 mb-4">
                  {weekApprovedLeaves.length === 0 && (
                    <div className="text-center text-sm text-muted-foreground">
                      No approved leave for this week.
                    </div>
                  )}
                </div>

                {/* Projects Sections (Job Group) */}
                <div className="border-[1px] rounded-lg">
                  <h3 className="p-5 text-lg font-semibold border-b">
                    <span className="flex items-center gap-2">
                      <ChevronDown /> Job Group : Billable
                    </span>
                  </h3>
                  {filteredProjects.map((project) => (
                    <div key={project.id} className="border-b border-gray-200">
                      <div className="grid grid-cols-8 gap-0">
                        <div className="col-span-8 p-3 pl-4 font-medium text-gray-800 bg-gray-50">
                          {project.name} ({project.project_type})
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {filteredProjects.length === 0 && (
                  <div className="bg-gray-50 p-4 border-b border-gray-200">
                    <div className="text-center text-sm text-muted-foreground">
                      No projects found for the selected filter.
                    </div>
                  </div>
                )}

                {/* Total Hours */}
                <div className="grid grid-cols-8 gap-0 bg-gray-100 p-3 rounded-b-md">
                  <div className="col-span-1 font-medium text-gray-800 pl-4">
                    Total Hours
                  </div>
                  {weekDates.map((_, i) => (
                    <div
                      key={i}
                      className="text-center text-sm font-medium text-gray-700"
                    >
                      {calculateTotalDailyHours[i] > 0
                        ? calculateTotalDailyHours[i].toFixed(1)
                        : "0"}
                    </div>
                  ))}
                </div>

                <div className="flex justify-end mt-4">
                  <Button
                    onClick={submitTimesheet}
                    className="bg-purple-500 hover:bg-purple-600 text-white"
                  >
                    Submit Timesheet
                  </Button>
                </div>
              </>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
