import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Play, Pause, Square, Clock, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import axiosInstance from "../../services/axiosInstance"; // Import the axios instance
import { useAuth } from "../../context/AuthContext"; // Import the auth hook

const TimeTracker = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [selectedTask, setSelectedTask] = useState("");
  const [description, setDescription] = useState("");
  const [activeSession, setActiveSession] = useState(null);
  const [timeEntries, setTimeEntries] = useState([]);

  const intervalRef = useRef(null);
  const startTimeRef = useRef(null);

  const user = useAuth();
  const employeeId = user?.id || null; // Fallback to null if not loaded
  console.log("Employee ID:", employeeId); // Debug log

  // Fetch projects on component mount
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await axiosInstance.get("/api/v1/project"); // Updated to plural
        console.log("Projects response:", response.data);
        setProjects(response?.data.projects || []);
      } catch (error) {
        console.error("Failed to fetch projects:", error);
        toast.error("Failed to load projects");
      }
    };
    fetchProjects();
  }, []);

  // Fetch tasks when project changes
  useEffect(() => {
    const fetchTasks = async () => {
      if (selectedProject) {
        try {
          const response = await axiosInstance.get(`/api/v1/task`); // Filter by project_id
          console.log("Tasks response:", response.data);
          setTasks(response.data.tasks || []); // Adjust based on actual response structure
          setSelectedTask(""); // Reset selected task when project changes
        } catch (error) {
          console.error("Failed to fetch tasks:", error);
          toast.error("Failed to load tasks");
        }
      } else {
        setTasks([]);
        setSelectedTask("");
      }
    };
    fetchTasks();
  }, [selectedProject]);

  // Timer logic
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        const currentTime = new Date();
        const startTime = startTimeRef.current || currentTime;
        const elapsed = Math.floor(
          (currentTime.getTime() - startTime.getTime()) / 1000
        );
        setElapsedSeconds(elapsed);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning]);

  const startTimer = async () => {
    if (!selectedProject || !selectedTask) {
      toast.success(
        "Please select a project and task before starting the timer."
      );
      return;
    }
    if (!employeeId) {
      toast.error("Employee ID not available. Please log in again.");
      return;
    }
    try {
      const response = await axiosInstance.post("/api/v1/time/clock-in", {
        project_id: selectedProject,
        employee_id: employeeId,
        task_id: selectedTask,
        description,
      });
      setActiveSession({
        ...response.data,
        project_id: selectedProject,
        task_id: selectedTask,
        description,
        start_time: new Date().toISOString(),
      });
      setIsRunning(true);
      setElapsedSeconds(0);
      startTimeRef.current = new Date();
      toast.success("Timer started");
    } catch (error) {
      toast.error(
        "Failed to start timer: " +
          (error.response?.data?.error || error.message)
      );
    }
  };
  const pauseTimer = () => {
    setIsRunning(false);
  };

  const resumeTimer = () => {
    startTimeRef.current = new Date(
      new Date().getTime() - elapsedSeconds * 1000
    );
    setIsRunning(true);
  };

  const stopTimer = async () => {
    if (!activeSession) return;
    try {
      const response = await axiosInstance.post(
        `/api/v1/time/clock-out/${activeSession.id}`,
        {}
      );
      toast.success(`Time logged: ${formatTime(elapsedSeconds)}`);
      setActiveSession(null);
      setIsRunning(false);
      setElapsedSeconds(0);
      setDescription("");
      setSelectedProject("");
      setSelectedTask("");
      fetchTimeEntries(); // Refresh time entries after stop
    } catch (error) {
      toast.error(
        "Failed to stop timer: " +
          (error.response?.data?.error || error.message)
      );
    }
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const fetchTimeEntries = async () => {
    if (!employeeId) {
      toast.error("Employee ID not available. Please log in again.");
      return;
    }
    const today = new Date();
    const { weekStart, weekEnd } = getWeekRange(today);
    try {
      const response = await axiosInstance.get("/api/v1/time/timesheets/week", {
        params: {
          employee_id: employeeId,
          week_start: weekStart,
          week_end: weekEnd,
        },
      });
      setTimeEntries(response.data.timeEntries || []);
      console.log(response.data.timeEntries);
    } catch (error) {
      console.error("Failed to fetch time entries:", error);
      toast.error("Failed to load time entries");
    }
  };

  const getWeekRange = (date) => {
    const inputDate = new Date(date);
    const day = inputDate.getDay();
    const diffToMonday = (day + 6) % 7;
    const weekStart = new Date(inputDate);
    weekStart.setDate(inputDate.getDate() - diffToMonday);
    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    return {
      weekStart: weekStart.toISOString().slice(0, 10),
      weekEnd: weekEnd.toISOString().slice(0, 10),
    };
  };

  useEffect(() => {
    if (isOpen) {
      fetchTimeEntries();
    }
  }, [isOpen]);

  return (
    <Card className="w-full mx-auto rounded-lg border shadow-lg">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <div
            className="flex items-center justify-between px-6 py-4 cursor-pointer bg-gradient-to-r from-gray-100 to-white hover:bg-gray-200 transition-colors"
            aria-hidden
          >
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-800">
                Time Tracker
              </h3>
            </div>
            <ChevronDown
              className={`h-5 w-5 text-gray-600 transition-transform duration-200 ${
                isOpen ? "rotate-180" : "rotate-0"
              }`}
            />
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent asChild>
          <div
            className={`overflow-hidden transition-all duration-500 ease-in-out ${
              isOpen ? "max-h-[1200px] opacity-100" : "max-h-0 opacity-0"
            }`}
          >
            <CardContent className="p-6 bg-gray-50">
              <div className="text-center mb-6">
                <div className="text-3xl font-mono font-bold text-blue-600 bg-white p-3 rounded-lg shadow-md">
                  {formatTime(elapsedSeconds)}
                </div>
                {isRunning && (
                  <div className="text-sm text-green-600 mt-1 font-semibold">
                    ● Recording...
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block text-gray-700">
                    Project
                  </label>
                  <Select
                    value={selectedProject}
                    onValueChange={setSelectedProject}
                    disabled={isRunning}
                  >
                    <SelectTrigger className="w-full border-gray-300">
                      <SelectValue placeholder="Select project" />
                    </SelectTrigger>
                    <SelectContent>
                      {projects.map((project) => (
                        <SelectItem
                          key={project.id}
                          value={project.id}
                          className="hover:bg-blue-100"
                        >
                          {project.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block text-gray-700">
                    Task
                  </label>
                  <Select
                    value={selectedTask}
                    onValueChange={setSelectedTask}
                    disabled={isRunning || !selectedProject}
                  >
                    <SelectTrigger className="w-full border-gray-300">
                      <SelectValue placeholder="Select task" />
                    </SelectTrigger>
                    <SelectContent>
                      {tasks.map((task) => (
                        <SelectItem
                          key={task.id}
                          value={task.id}
                          className="hover:bg-blue-100"
                        >
                          {task.title || task.task_title}{" "}
                          {/* Fallback to task_title if title is undefined */}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block text-gray-700">
                    Description
                  </label>
                  <Input
                    placeholder="What are you working on?"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    disabled={isRunning}
                    className="border-gray-300 focus:ring-blue-500"
                  />
                </div>

                <div className="flex gap-2 justify-center pt-4">
                  {!activeSession ? (
                    <Button
                      onClick={startTimer}
                      className="flex items-center gap-2 bg-blue-600 text-white hover:bg-blue-700"
                      disabled={!selectedProject || !selectedTask}
                    >
                      <Play className="h-4 w-4" />
                      Start
                    </Button>
                  ) : (
                    <>
                      {isRunning ? (
                        <Button
                          onClick={pauseTimer}
                          variant="outline"
                          className="flex items-center gap-2 border-blue-600 text-blue-600 hover:bg-blue-50"
                        >
                          <Pause className="h-4 w-4" />
                          Pause
                        </Button>
                      ) : (
                        <Button
                          onClick={resumeTimer}
                          className="flex items-center gap-2 bg-blue-600 text-white hover:bg-blue-700"
                        >
                          <Play className="h-4 w-4" />
                          Resume
                        </Button>
                      )}
                      <Button
                        onClick={stopTimer}
                        variant="destructive"
                        className="flex items-center gap-2 bg-red-600 text-white hover:bg-red-700"
                      >
                        <Square className="h-4 w-4" />
                        Stop
                      </Button>
                    </>
                  )}
                </div>

                <div className="mt-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Clock className="h-5 w-5 text-blue-600" />
                    Daily Time Entries
                  </h4>
                  {timeEntries.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {timeEntries.map((entry) => (
                        <Card
                          key={entry.id}
                          className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-200 rounded-lg overflow-hidden"
                        >
                          <CardContent className="p-4">
                            <h5 className="font-medium text-gray-700">
                              {entry.description || "No description"}
                            </h5>
                            <p className="text-sm text-gray-500">
                              Date: {new Date(entry.date).toLocaleDateString()}
                            </p>
                            <p className="text-sm text-gray-500">
                              Time:{" "}
                              {formatTime(
                                Math.floor(
                                  (new Date(entry.clock_out || new Date()) -
                                    new Date(entry.clock_in)) /
                                    1000
                                )
                              )}
                            </p>
                            <div className="mt-2 flex justify-between items-center">
                              <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                                {entry.task ? entry.task.name : "Unknown Task"}
                              </span>
                              <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                                {entry.hours || "0.00"} hrs
                              </span>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-gray-500">
                      No time entries for this week.
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

export default TimeTracker;
