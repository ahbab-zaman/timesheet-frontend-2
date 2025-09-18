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
import axiosInstance from "../../services/axiosInstance";

const TimeTracker = ({
  timeEntries,
  setTimeEntries,
  refreshTimeEntries,
  currentEmployee,
  refreshTimesheets, // Added prop
}) => {
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [selectedTask, setSelectedTask] = useState("");
  const [description, setDescription] = useState("");
  const [activeSession, setActiveSession] = useState(null);

  const intervalRef = useRef(null);
  const startTimeRef = useRef(null);

  const employeeId = currentEmployee?.id || null;

  // Helper to get local date string in YYYY-MM-DD format
  const getLocalDateString = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Fetch projects on mount
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await axiosInstance.get("/api/v1/project");
        setProjects(response?.data.projects || []);
      } catch (error) {
        console.error("Failed to fetch projects:", error);
        toast.error("Failed to load projects");
      }
    };
    fetchProjects();
  }, []);

  // Fetch tasks when selectedProject changes
  useEffect(() => {
    const fetchTasks = async () => {
      if (selectedProject) {
        try {
          const response = await axiosInstance.get(`/api/v1/task`, {
            params: { project_id: selectedProject },
          });
          setTasks(response.data.tasks || []);
          setSelectedTask("");
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

  // Check for active session on mount
  useEffect(() => {
    const checkActiveSession = async () => {
      if (!employeeId) return;
      try {
        const response = await axiosInstance.get(
          "/api/v1/time/active-session",
          {
            params: { employee_id: employeeId },
          }
        );
        const session = response.data?.activeSession;
        if (session) {
          setActiveSession(session);
          setSelectedProject(session.project_id);
          setSelectedTask(session.task_id);
          setDescription(session.description || "");
          setIsRunning(true);
          startTimeRef.current = new Date(session.start_time);
          const currentTime = new Date();
          const elapsed = Math.floor(
            (currentTime.getTime() - new Date(session.start_time).getTime()) /
              1000
          );
          setElapsedSeconds(elapsed);
        }
      } catch (error) {
        console.error("Failed to fetch active session:", error);
      }
    };
    checkActiveSession();
  }, [employeeId]);

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
      toast.error(
        "Please select a project and task before starting the timer."
      );
      return;
    }
    if (!employeeId) {
      toast.error("Employee ID not available. Please log in again.");
      return;
    }
    try {
      const localDate = getLocalDateString();
      const response = await axiosInstance.post("/api/v1/time/clock-in", {
        project_id: selectedProject,
        employee_id: employeeId,
        task_id: selectedTask,
        description,
        date: localDate,
      });

      const newEntry = response.data?.timeEntry || response.data;
      setActiveSession(newEntry);
      setIsRunning(true);
      setElapsedSeconds(0);
      startTimeRef.current = new Date();
      toast.success("Timer started");
      refreshTimeEntries();
    } catch (error) {
      console.error("Failed to start timer:", error.response || error);
      toast.error(
        "Failed to start timer: " +
          (error.response?.data?.error || error.message)
      );
    }
  };

  const pauseTimer = () => {
    setIsRunning(false);
    toast.success("Timer paused");
  };

  const resumeTimer = () => {
    startTimeRef.current = new Date(
      new Date().getTime() - elapsedSeconds * 1000
    );
    setIsRunning(true);
    toast.success("Timer resumed");
  };

  const stopTimer = async () => {
    if (!activeSession) {
      toast.error("No active session to stop.");
      return;
    }
    if (elapsedSeconds < 60) {
      toast.error("You cannot stop the timer until one minute has elapsed.");
      return;
    }
    try {
      const localDate = getLocalDateString();
      await axiosInstance.post(`/api/v1/time/clock-out/${activeSession.id}`, {
        date: localDate,
      });
      toast.success(`Time logged: ${formatTime(elapsedSeconds)}`);
      setActiveSession(null);
      setIsRunning(false);
      setElapsedSeconds(0);
      setDescription("");
      setSelectedProject("");
      setSelectedTask("");
      refreshTimeEntries();
      if (refreshTimesheets) {
        await refreshTimesheets(); // Trigger timesheet refresh
      }
    } catch (error) {
      console.error("Failed to stop timer:", error.response || error);
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
                    disabled={isRunning || activeSession}
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
                    disabled={isRunning || activeSession || !selectedProject}
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
                          {task.title || task.task_title}
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
                    disabled={isRunning || activeSession}
                    className="border-gray-300 focus:ring-blue-500"
                  />
                </div>

                <div className="flex gap-2 justify-center pt-4">
                  {!activeSession && !isRunning ? (
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
                        disabled={!activeSession || elapsedSeconds < 60}
                      >
                        <Square className="h-4 w-4" />
                        Stop
                      </Button>
                    </>
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
