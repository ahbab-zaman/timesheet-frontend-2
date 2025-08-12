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

const TimeTracker = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isOpen, setIsOpen] = useState(false); // CLOSED by default
  const [projects] = useState([
    { id: "1", name: "Website Redesign" },
    { id: "2", name: "Mobile App Development" },
    { id: "3", name: "E-commerce Platform" },
    { id: "4", name: "Social Media Marketing Campaign" },
  ]);
  const [tasks, setTasks] = useState([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [selectedTask, setSelectedTask] = useState("");
  const [description, setDescription] = useState("");
  const [activeSession, setActiveSession] = useState(null);

  const intervalRef = useRef(null);
  const startTimeRef = useRef(null);

  // Dummy tasks for each project
  const dummyTasks = {
    1: [
      { id: "1", task_title: "Design UI" },
      { id: "1", task_title: "Develop Landing Page" },
      { id: "1", task_title: "Create Logo" },
      { id: "1", task_title: "Write Brand Guidelines" },
    ],
    2: [
      { id: "2", task_title: "Build API" },
      { id: "2", task_title: "Integrate Payment Gateway" },
      { id: "2", task_title: "Setup Database" },
      { id: "2", task_title: "Implement Authentication" },
    ],
    3: [
      { id: "3", task_title: "Conduct Market Research" },
      { id: "3", task_title: "Prepare Presentation Slides" },
      { id: "3", task_title: "Plan Social Media Campaign" },
    ],
    4: [
      { id: "4", task_title: "Write Test Cases" },
      { id: "4", task_title: "Perform QA Testing" },
      { id: "4", task_title: "Fix Reported Bugs" },
    ],
  };

  useEffect(() => {
    if (selectedProject) {
      setTasks(dummyTasks[selectedProject] || []);
    } else {
      setTasks([]);
    }
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

  const startTimer = () => {
    if (!selectedProject || !selectedTask) {
      toast.success(
        "Please select a project and task before starting the timer."
      );
      return;
    }
    setActiveSession({
      project_id: selectedProject,
      task_id: selectedTask,
      description,
      start_time: new Date().toISOString(),
    });
    setIsRunning(true);
    setElapsedSeconds(0);
    startTimeRef.current = new Date();
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

  const stopTimer = () => {
    toast.success(`Time logged: ${formatTime(elapsedSeconds)}`);
    setActiveSession(null);
    setIsRunning(false);
    setElapsedSeconds(0);
    setDescription("");
    setSelectedProject("");
    setSelectedTask("");
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
    <Card className="w-ful mx-auto rounded-lg border">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        {/* Header (clickable) */}
        <CollapsibleTrigger asChild>
          <div
            className="flex items-center justify-between px-6 py-4 cursor-pointer"
            aria-hidden
          >
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Time Tracker</h3>
            </div>

            {/* single chevron that rotates */}
            <ChevronDown
              className={`h-5 w-5 transition-transform duration-200 ${
                isOpen ? "rotate-180" : "rotate-0"
              }`}
            />
          </div>
        </CollapsibleTrigger>

        {/* Smooth animated wrapper using max-height + opacity */}
        <CollapsibleContent asChild>
          <div
            className={`overflow-hidden transition-all duration-500 ease-in-out ${
              isOpen ? "max-h-[1200px] opacity-100" : "max-h-0 opacity-0"
            }`}
          >
            <CardContent className="p-6">
              <div className="text-center mb-6">
                <div className="flex items-center justify-center gap-2 mb-2">
                  {/* Clock icon already in header; keeping layout similar */}
                </div>
                <div className="text-3xl font-mono font-bold text-primary">
                  {formatTime(elapsedSeconds)}
                </div>
                {isRunning && (
                  <div className="text-sm text-green-600 mt-1">
                    ● Recording...
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Project
                  </label>
                  <Select
                    value={selectedProject}
                    onValueChange={setSelectedProject}
                    disabled={isRunning}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select project" />
                    </SelectTrigger>
                    <SelectContent>
                      {projects.map((project) => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Task</label>
                  <Select
                    value={selectedTask}
                    onValueChange={setSelectedTask}
                    disabled={isRunning || !selectedProject}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select task" />
                    </SelectTrigger>
                    <SelectContent>
                      {tasks.map((task) => (
                        <SelectItem key={task.id} value={task.id}>
                          {task.task_title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Description
                  </label>
                  <Input
                    placeholder="What are you working on?"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    disabled={isRunning}
                  />
                </div>

                <div className="flex gap-2 justify-center pt-4">
                  {!activeSession ? (
                    <Button
                      onClick={startTimer}
                      className="flex items-center gap-2"
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
                          className="flex items-center gap-2"
                        >
                          <Pause className="h-4 w-4" />
                          Pause
                        </Button>
                      ) : (
                        <Button
                          onClick={resumeTimer}
                          className="flex items-center gap-2"
                        >
                          <Play className="h-4 w-4" />
                          Resume
                        </Button>
                      )}
                      <Button
                        onClick={stopTimer}
                        variant="destructive"
                        className="flex items-center gap-2"
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
