import { useState, useEffect, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Plus,
  Search,
  Calendar,
  Clock,
  Filter,
  MoreHorizontal,
} from "lucide-react";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import debounce from "lodash.debounce";
import axiosInstance from "../../services/axiosInstance";

const TaskManagement = () => {
  const { toast } = useToast();
  const [projects, setProjects] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("activities");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [editingTask, setEditingTask] = useState(null);
  const [errors, setErrors] = useState({});
  const [selectedProject, setSelectedProject] = useState("");
  const [newProjectName, setNewProjectName] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [taskTitle, setTaskTitle] = useState("");
  const [description, setDescription] = useState("");
  const [estimatedHours, setEstimatedHours] = useState("");
  const [startDate, setStartDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [projectType, setProjectType] = useState("");
  const [milestoneRecurring, setMilestoneRecurring] = useState("");
  const [showNewProject, setShowNewProject] = useState(false);

  // Debounce search input
  const debouncedSetSearchTerm = useCallback(
    debounce((value) => {
      setSearchTerm(value);
    }, 300),
    []
  );

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      debouncedSetSearchTerm.cancel();
    };
  }, [debouncedSetSearchTerm]);

  // Fetch data with error handling
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [projRes, empRes, taskRes] = await Promise.all([
        axiosInstance.get("/api/v1/project"),
        axiosInstance.get("/api/v1/employee"),
        axiosInstance.get("/api/v1/task"),
      ]);

      const projData = Array.isArray(projRes.data.projects)
        ? projRes.data.projects
        : projRes.data.projects || [];
      setProjects(projData);

      const empData = Array.isArray(empRes.data.employees)
        ? empRes.data.employees
        : empRes.data.employees || [];
      setEmployees(empData);

      const fetchedTasks = taskRes.data.tasks || taskRes.data || [];
      console.log("Fetched tasks:", fetchedTasks); // Debug: Inspect raw task data
      setTasks(fetchedTasks);

      setActivities(
        fetchedTasks.map((task) => ({
          id: task.id,
          status: task.status ? task.status.toUpperCase() : "ASSIGNED",
          project: task.project?.name || task.project_id || "N/A",
          project_type: task.project_type || "N/A",
          milestone_recurring: task.milestone_description || "N/A",
          freelancer: task.employee?.name || task.employee_id || "N/A",
          task: task.title || "Untitled",
          start_date: task.start_date
            ? format(new Date(task.start_date), "yyyy-MM-dd")
            : format(new Date(task.created_at || Date.now()), "yyyy-MM-dd"),
          due_date: task.due_date
            ? format(new Date(task.due_date), "yyyy-MM-dd")
            : "N/A",
          project_id: task.project?.id || task.project_id,
          employee_id: task.employee?.id || task.employee_id,
        }))
      );
    } catch (error) {
      console.error("Fetch error:", error);
      toast({
        title: "Error fetching data",
        description: "Failed to load data. Check console for details.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (editingTask) {
      const taskToEdit = tasks.find((t) => t.id === editingTask.id);
      if (taskToEdit && taskToEdit.id === editingTask.id) {
        setSelectedProject(taskToEdit.project_id?.toString() || "");
        setSelectedEmployee(taskToEdit.employee_id?.toString() || "");
        setTaskTitle(taskToEdit.title || "");
        setDescription(taskToEdit.description || "");
        setEstimatedHours(taskToEdit.estimated_hours?.toString() || "");
        setStartDate(taskToEdit.start_date || "");
        setDueDate(taskToEdit.due_date || "");
        setProjectType(taskToEdit.project_type || "");
        setMilestoneRecurring(taskToEdit.milestone_description || "");
        setShowNewProject(false);
        setErrors({});
      }
    }
  }, [editingTask?.id, tasks]);

  const resetForm = useCallback(() => {
    setSelectedProject("");
    setNewProjectName("");
    setSelectedEmployee("");
    setTaskTitle("");
    setDescription("");
    setEstimatedHours("");
    setStartDate("");
    setDueDate("");
    setProjectType("");
    setMilestoneRecurring("");
    setShowNewProject(false);
    setEditingTask(null);
    setErrors({});
  }, []);

  const validateForm = useCallback(() => {
    const err = {};
    if (!showNewProject && !selectedProject) {
      err.project = "Project is required";
    }
    if (showNewProject && !newProjectName) {
      err.newProject = "New project name is required";
    }
    if (!selectedEmployee) {
      err.employee = "Employee is required";
    }
    if (!taskTitle) {
      err.title = "Task title is required";
    }
    if (estimatedHours && isNaN(parseFloat(estimatedHours))) {
      err.estimatedHours = "Estimated hours must be a number";
    }
    if (startDate && dueDate && new Date(startDate) > new Date(dueDate)) {
      err.dueDate = "Due date must be after or equal to start date";
    }
    setErrors(err);
    return Object.keys(err).length === 0;
  }, [
    showNewProject,
    selectedProject,
    newProjectName,
    selectedEmployee,
    taskTitle,
    estimatedHours,
    startDate,
    dueDate,
  ]);

  const handleSubmit = useCallback(async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      let projectId = selectedProject;

      if (showNewProject) {
        const newProjRes = await axiosInstance.post("/api/v1/project/create", {
          name: newProjectName,
        });
        projectId = newProjRes.data.project?.id || newProjRes.data.id;
      }

      const taskData = {
        project_id: parseInt(projectId),
        employee_id: parseInt(selectedEmployee),
        title: taskTitle,
        description: description,
        estimated_hours: parseInt(estimatedHours) || 0,
        start_date: startDate || null,
        due_date: dueDate || null,
        project_type: projectType,
        milestone_description: milestoneRecurring,
        status: editingTask ? editingTask.status.toLowerCase() : "assigned",
      };

      if (editingTask) {
        await axiosInstance.patch(`/api/v1/task/${editingTask.id}`, taskData);
        toast({
          title: "Activity updated successfully! 🎯",
          description: "The activity has been updated.",
        });
      } else {
        await axiosInstance.post("/api/v1/task/create", taskData);
        toast({
          title: "Activity created successfully! 🎯",
          description: "The activity has been assigned to the freelancer.",
        });
      }

      await fetchData();
      setIsDialogOpen(false); // Close dialog before resetting form
      resetForm();
    } catch (error) {
      console.error("Submit error:", error);
      toast({
        title: editingTask
          ? "Error updating activity"
          : "Error creating activity",
        description:
          "Failed to process the activity. Check console for details.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [
    validateForm,
    selectedProject,
    showNewProject,
    newProjectName,
    selectedEmployee,
    taskTitle,
    description,
    estimatedHours,
    startDate,
    dueDate,
    projectType,
    milestoneRecurring,
    editingTask,
    toast,
    fetchData,
    resetForm,
  ]);

  const handleDelete = useCallback(
    async (activityId) => {
      setLoading(true);
      try {
        await axiosInstance.delete(`/api/v1/task/${activityId}`);
        toast({
          title: "Activity deleted successfully",
          description: "The activity has been removed.",
        });
        await fetchData();
      } catch (error) {
        console.error("Delete error:", error);
        toast({
          title: "Error deleting activity",
          description:
            "Failed to delete the activity. Check console for details.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    },
    [toast, fetchData]
  );

  const getStatusDisplay = useCallback((status) => {
    return status; // Return plain text instead of Badge
  }, []);

  const getProjectTypeBadge = useCallback((type) => {
    const variants = {
      Milestone: { color: "bg-purple-100 text-purple-700 border-purple-200" },
      Fixed: { color: "bg-orange-100 text-orange-700 border-orange-200" },
      Recurring: { color: "bg-green-100 text-green-700 border-green-200" },
    };
    const config = variants[type] || variants.Milestone;
    return (
      <Badge variant="outline" className={config.color}>
        {type}
      </Badge>
    );
  }, []);

  const filteredActivities = useMemo(() => {
    console.log("Filtering with statusFilter:", statusFilter); // Debug: Log current filter
    console.log(
      "Available statuses:",
      Array.from(new Set(activities.map((a) => a.status)))
    ); // Debug: Log unique status values

    return activities.filter((activity) => {
      const matchesSearch =
        searchTerm === "" ||
        activity.project.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.task.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.freelancer.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || activity.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [activities, searchTerm, statusFilter]);

  if (loading) {
    return (
      <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Task Management</h2>
          <p className="text-muted-foreground">
            Manage activities and projects for your team
          </p>
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger
              value="activities"
              className="data-[state=active]:bg-primary data-[state=active]:text-white"
            >
              Activities
            </TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
          </TabsList>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Activity
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>
                  {editingTask ? "Edit Activity" : "Add New Activity"}
                </DialogTitle>
                <DialogDescription>
                  {editingTask
                    ? "Update the activity details."
                    : "Create and assign a new activity to a freelancer."}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="project">Project *</Label>
                    {!showNewProject ? (
                      <div className="space-y-2">
                        <Select
                          value={selectedProject}
                          onValueChange={setSelectedProject}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a project" />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.isArray(projects) &&
                              projects.map((project) => (
                                <SelectItem
                                  key={project.id}
                                  value={project.id.toString()}
                                >
                                  {project.name}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                        {errors.project && (
                          <p className="text-red-500 text-sm">
                            {errors.project}
                          </p>
                        )}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setShowNewProject(true)}
                          className="w-full"
                        >
                          Create New Project
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Input
                          placeholder="Enter new project name"
                          value={newProjectName}
                          onChange={(e) => setNewProjectName(e.target.value)}
                        />
                        {errors.newProject && (
                          <p className="text-red-500 text-sm">
                            {errors.newProject}
                          </p>
                        )}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setShowNewProject(false);
                            setNewProjectName("");
                          }}
                          className="w-full"
                        >
                          Use Existing Project
                        </Button>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="employee">Assign to Employee *</Label>
                    <Select
                      value={selectedEmployee}
                      onValueChange={setSelectedEmployee}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a freelancer" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.isArray(employees) &&
                          employees.map((employee) => (
                            <SelectItem
                              key={employee.id}
                              value={employee.id.toString()}
                            >
                              {employee.name} ({employee.department || "N/A"})
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    {errors.employee && (
                      <p className="text-red-500 text-sm">{errors.employee}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="project-type">Project Type</Label>
                    <Select value={projectType} onValueChange={setProjectType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select project type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Milestone">Milestone</SelectItem>
                        <SelectItem value="Fixed">Fixed</SelectItem>
                        <SelectItem value="Recurring">Recurring</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="milestone-recurring">
                      Milestone/Recurring Description
                    </Label>
                    <Input
                      placeholder="e.g., UI Designer, Build the whole project"
                      value={milestoneRecurring}
                      onChange={(e) => setMilestoneRecurring(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="task-title">Task Title *</Label>
                    <Input
                      id="task-title"
                      placeholder="Enter task title"
                      value={taskTitle}
                      onChange={(e) => setTaskTitle(e.target.value)}
                    />
                    {errors.title && (
                      <p className="text-red-500 text-sm">{errors.title}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe the task details..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="estimated-hours">Estimated Hours</Label>
                    <Input
                      id="estimated-hours"
                      type="number"
                      step="0.5"
                      min="0"
                      placeholder="0"
                      value={estimatedHours}
                      onChange={(e) => setEstimatedHours(e.target.value)}
                    />
                    {errors.estimatedHours && (
                      <p className="text-red-500 text-sm">
                        {errors.estimatedHours}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="start-date">Start Date</Label>
                    <Input
                      id="start-date"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="due-date">Due Date</Label>
                    <Input
                      id="due-date"
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                    />
                    {errors.dueDate && (
                      <p className="text-red-500 text-sm">{errors.dueDate}</p>
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    {loading
                      ? "Processing..."
                      : editingTask
                      ? "Update Activity"
                      : "Create Activity"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <TabsContent value="activities" className="space-y-4">
          <div className="flex gap-4 items-center">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="search"
                onChange={(e) => debouncedSetSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="IN PROGRESS">In Progress</SelectItem>
                <SelectItem value="ASSIGNED">Assigned</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="ON_HOLD">On Hold</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-purple-100 hover:bg-purple-100">
                      <TableHead className="font-semibold text-black">
                        Status
                      </TableHead>
                      <TableHead className="font-semibold text-black">
                        Project
                      </TableHead>
                      <TableHead className="font-semibold text-black">
                        Project Type
                      </TableHead>
                      <TableHead className="font-semibold text-black">
                        Milestone/Recurring
                      </TableHead>
                      <TableHead className="font-semibold text-black">
                        Freelancer
                      </TableHead>
                      <TableHead className="font-semibold text-black">
                        Task
                      </TableHead>
                      <TableHead className="font-semibold text-black">
                        Start Date
                      </TableHead>
                      <TableHead className="font-semibold text-black">
                        Due Date
                      </TableHead>
                      <TableHead className="font-semibold text-black w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredActivities.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-10">
                          <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4 animate-pulse" />
                          <h3 className="text-xl font-semibold text-gray-600">
                            No Data Found
                          </h3>
                          <p className="text-gray-500">
                            It looks like there are no activities to display.
                            Try adding a new one!
                          </p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredActivities.map((activity) => (
                        <TableRow
                          key={activity.id}
                          className="hover:bg-muted/50"
                        >
                          <TableCell className="badge">
                            <Badge>{getStatusDisplay(activity.status)}</Badge>
                          </TableCell>
                          <TableCell className="font-medium">
                            {activity.project}
                          </TableCell>
                          <TableCell>
                            {getProjectTypeBadge(activity.project_type)}
                          </TableCell>
                          <TableCell className="max-w-48">
                            <span className="text-pink-600 font-medium">
                              {activity.milestone_recurring}
                            </span>
                          </TableCell>
                          <TableCell>{activity.freelancer}</TableCell>
                          <TableCell>{activity.task}</TableCell>
                          <TableCell>{activity.start_date}</TableCell>
                          <TableCell>{activity.due_date}</TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => {
                                    setEditingTask(activity);
                                    setIsDialogOpen(true);
                                  }}
                                >
                                  Edit Activity
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-red-600"
                                  onClick={() => handleDelete(activity.id)}
                                >
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="projects" className="space-y-4">
          <div className="grid gap-4">
            {Array.isArray(projects) && projects.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">
                    No projects found
                  </h3>
                  <p className="text-muted-foreground">
                    Create your first project to get started.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.isArray(projects) &&
                  projects.map((project) => (
                    <Card
                      key={project.id}
                      className="hover:shadow-lg transition-shadow"
                    >
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          {project.name}
                          <Badge variant="outline">
                            {project.status || "active"}
                          </Badge>
                        </CardTitle>
                        <CardDescription>
                          {project.description || "No description"}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">
                            {
                              tasks.filter(
                                (t) => t.project?.name === project.name
                              ).length
                            }{" "}
                            tasks
                          </span>
                          <Button variant="outline" size="sm">
                            View Tasks
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TaskManagement;
