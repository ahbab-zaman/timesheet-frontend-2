// import { useState, useEffect } from "react";
// import { Button } from "@/components/ui/button";
// import { Calendar, Plus, Users, Edit, Trash } from "lucide-react";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog";
// import { Input } from "@/components/ui/input";
// import { Textarea } from "@/components/ui/textarea";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Label } from "@/components/ui/label";
// import axiosInstance from "../../services/axiosInstance"; // Adjust path as needed

// const ManagerTaskManagement = () => {
//   const [tasks, setTasks] = useState([]);
//   const [open, setOpen] = useState(false);
//   const [error, setError] = useState(null);
//   const [formData, setFormData] = useState({
//     id: null,
//     title: "",
//     description: "",
//     estimated_hours: "",
//     start_date: "",
//     due_date: "",
//     project_id: "",
//     employee_id: "",
//   });
//   const [dialogMode, setDialogMode] = useState("create"); // "create", "edit", or "delete"

//   // Mock data matching database records
//   const projects = [
//     { id: 1, name: "Project Alpha" },
//     { id: 2, name: "Project Beta" },
//     { id: 3, name: "Project Gamma" },
//   ];
//   const employees = [
//     { id: 1, name: "John Doe" },
//     { id: 2, name: "Jane Smith" },
//     { id: 3, name: "Alice Johnson" },
//   ];

//   // Fetch tasks on component mount
//   useEffect(() => {
//     const fetchTasks = async () => {
//       try {
//         const response = await axiosInstance.get("/api/v1/task");
//         setTasks(response.data.tasks || []);
//         setError(null);
//       } catch (error) {
//         console.error("Error fetching tasks:", error);
//         setError("Failed to load tasks. Please try again.");
//       }
//     };
//     fetchTasks();
//   }, []);

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleSelectChange = (name, value) => {
//     setFormData((prev) => ({ ...prev, [name]: parseInt(value, 10) }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (
//       formData.title.trim() &&
//       formData.estimated_hours &&
//       formData.start_date &&
//       formData.due_date &&
//       formData.project_id &&
//       formData.employee_id
//     ) {
//       try {
//         let response;
//         if (dialogMode === "create") {
//           response = await axiosInstance.post("/api/v1/task/create", {
//             ...formData,
//             project_id: parseInt(formData.project_id, 10),
//             employee_id: parseInt(formData.employee_id, 10),
//             estimated_hours: parseInt(formData.estimated_hours, 10),
//           });
//         } else if (dialogMode === "edit" && formData.id) {
//           response = await axiosInstance.patch(`/api/v1/task/${formData.id}`, {
//             ...formData,
//             project_id: parseInt(formData.project_id, 10),
//             employee_id: parseInt(formData.employee_id, 10),
//             estimated_hours: parseInt(formData.estimated_hours, 10),
//           });
//         }
//         const tasksResponse = await axiosInstance.get("/api/v1/task");
//         setTasks(tasksResponse.data.tasks || []);
//         setFormData({
//           id: null,
//           title: "",
//           description: "",
//           estimated_hours: "",
//           start_date: "",
//           due_date: "",
//           project_id: "",
//           employee_id: "",
//         });
//         setOpen(false);
//         setError(null);
//       } catch (error) {
//         console.error(
//           `Error ${dialogMode === "create" ? "creating" : "updating"} task:`,
//           error
//         );
//         setError(
//           `Failed to ${
//             dialogMode === "create" ? "create" : "update"
//           } task. Ensure IDs are valid.`
//         );
//       }
//     } else {
//       setError("Please fill all required fields.");
//     }
//   };

//   const handleDelete = async () => {
//     if (formData.id) {
//       try {
//         await axiosInstance.delete(`/api/v1/task/${formData.id}`);
//         const tasksResponse = await axiosInstance.get("/api/v1/task");
//         setTasks(tasksResponse.data.tasks || []);
//         setFormData({
//           id: null,
//           title: "",
//           description: "",
//           estimated_hours: "",
//           start_date: "",
//           due_date: "",
//           project_id: "",
//           employee_id: "",
//         });
//         setOpen(false);
//         setDialogMode("create"); // Reset dialog mode after delete
//         setError(null);
//       } catch (error) {
//         console.error("Error deleting task:", error);
//         setError("Failed to delete task.");
//       }
//     }
//   };

//   const openEditDialog = (task) => {
//     setFormData({
//       id: task.id,
//       title: task.title,
//       description: task.description || "",
//       estimated_hours: task.estimated_hours,
//       start_date: task.start_date,
//       due_date: task.due_date,
//       project_id: task.project_id,
//       employee_id: task.employee_id,
//     });
//     setDialogMode("edit");
//     setOpen(true);
//   };

//   const openDeleteDialog = (task) => {
//     setFormData({ id: task.id });
//     setDialogMode("delete");
//     setOpen(true);
//   };

//   const openCreateDialog = () => {
//     setFormData({
//       id: null,
//       title: "",
//       description: "",
//       estimated_hours: "",
//       start_date: "",
//       due_date: "",
//       project_id: "",
//       employee_id: "",
//     });
//     setDialogMode("create");
//     setOpen(true);
//   };

//   return (
//     <>
//       <div className="flex justify-between items-center">
//         <div>
//           <h2 className="text-2xl font-bold">AIREPRO Task Management</h2>
//           <p className="text-[#64748B]">
//             Create and manage tasks for your team
//           </p>
//         </div>
//         <div>
//           <Dialog open={open} onOpenChange={setOpen}>
//             <DialogTrigger asChild>
//               <Button onClick={openCreateDialog}>
//                 <Plus className="mr-2 h-4 w-4" /> Create Task
//               </Button>
//             </DialogTrigger>
//             <DialogContent>
//               <DialogHeader>
//                 <DialogTitle>
//                   {dialogMode === "create" && "Create New Task"}
//                   {dialogMode === "edit" && "Edit Task"}
//                   {dialogMode === "delete" && "Confirm Delete"}
//                 </DialogTitle>
//                 <DialogDescription>
//                   {dialogMode === "create" &&
//                     "Fill in the details to create a new task for your team."}
//                   {dialogMode === "edit" &&
//                     "Update the details for the selected task."}
//                   {dialogMode === "delete" &&
//                     "Are you sure you want to delete this task? This action cannot be undone."}
//                 </DialogDescription>
//               </DialogHeader>
//               {error && <p className="text-red-500 text-sm">{error}</p>}
//               {dialogMode !== "delete" ? (
//                 <form onSubmit={handleSubmit} className="space-y-4">
//                   <div className="flex items-center gap-2 w-full">
//                     <div className="w-1/2">
//                       <Label htmlFor="project_id">Project</Label>
//                       <Select
//                         value={formData.project_id || ""}
//                         onValueChange={(value) =>
//                           handleSelectChange("project_id", value)
//                         }
//                         required
//                       >
//                         <SelectTrigger>
//                           <SelectValue placeholder="Select project" />
//                         </SelectTrigger>
//                         <SelectContent>
//                           {projects.map((project) => (
//                             <SelectItem key={project.id} value={project.id}>
//                               {project.name}
//                             </SelectItem>
//                           ))}
//                         </SelectContent>
//                       </Select>
//                     </div>
//                     <div className="w-1/2">
//                       <Label htmlFor="employee_id">Assign to Employee</Label>
//                       <Select
//                         value={formData.employee_id || ""}
//                         onValueChange={(value) =>
//                           handleSelectChange("employee_id", value)
//                         }
//                         required
//                       >
//                         <SelectTrigger>
//                           <SelectValue placeholder="Select employee" />
//                         </SelectTrigger>
//                         <SelectContent>
//                           {employees.map((employee) => (
//                             <SelectItem key={employee.id} value={employee.id}>
//                               {employee.name}
//                             </SelectItem>
//                           ))}
//                         </SelectContent>
//                       </Select>
//                     </div>
//                   </div>

//                   <div className="space-y-2">
//                     <Label htmlFor="title">Task Title</Label>
//                     <Input
//                       id="title"
//                       name="title"
//                       value={formData.title}
//                       onChange={handleInputChange}
//                       placeholder="Enter task title"
//                       required
//                     />
//                   </div>

//                   <div className="space-y-2">
//                     <Label htmlFor="description">Description</Label>
//                     <Textarea
//                       id="description"
//                       name="description"
//                       value={formData.description}
//                       onChange={handleInputChange}
//                       placeholder="Enter task description"
//                       className="resize-none"
//                     />
//                   </div>
//                   <div className="flex justify-between items-center gap-3">
//                     <div className="space-y-2 w-full">
//                       <Label htmlFor="estimated_hours">Estimated Hours</Label>
//                       <Input
//                         id="estimated_hours"
//                         name="estimated_hours"
//                         type="number"
//                         value={formData.estimated_hours}
//                         onChange={handleInputChange}
//                         placeholder="Enter hours"
//                         required
//                       />
//                     </div>
//                     <div className="space-y-2 w-full">
//                       <Label htmlFor="start_date">Start Date</Label>
//                       <Input
//                         id="start_date"
//                         name="start_date"
//                         type="date"
//                         value={formData.start_date}
//                         onChange={handleInputChange}
//                         required
//                       />
//                     </div>
//                     <div className="space-y-2 w-full">
//                       <Label htmlFor="due_date">Due Date</Label>
//                       <Input
//                         id="due_date"
//                         name="due_date"
//                         type="date"
//                         value={formData.due_date}
//                         onChange={handleInputChange}
//                         required
//                       />
//                     </div>
//                   </div>
//                   <div className="flex justify-end gap-2">
//                     <Button variant="outline" onClick={() => setOpen(false)}>
//                       Cancel
//                     </Button>
//                     <Button type="submit">
//                       {dialogMode === "create" && "Create Task"}
//                       {dialogMode === "edit" && "Save Changes"}
//                     </Button>
//                   </div>
//                 </form>
//               ) : (
//                 <div className="space-y-4">
//                   <p className="text-gray-600">
//                     Are you sure you want to delete the task "
//                     {tasks.find((t) => t.id === formData.id)?.title ||
//                       "Unknown"}
//                     "?
//                   </p>
//                   <div className="flex justify-end gap-2">
//                     <Button variant="outline" onClick={() => setOpen(false)}>
//                       Cancel
//                     </Button>
//                     <Button variant="destructive" onClick={handleDelete}>
//                       <Trash className="mr-2 h-4 w-4" /> Delete
//                     </Button>
//                   </div>
//                 </div>
//               )}
//             </DialogContent>
//           </Dialog>
//         </div>
//       </div>
//       {tasks.length === 0 ? (
//         <div className="mt-6 text-center">
//           <Calendar className="h-12 w-12 mx-auto text-gray-500 mb-4" />
//           <h3 className="text-lg font-medium">No tasks found</h3>
//           <p className="text-gray-500">Create a task to get started.</p>
//         </div>
//       ) : (
//         <div className="mt-6">
//           {tasks.map((task) => (
//             <div
//               key={task.id}
//               className="p-6 border rounded-lg shadow-sm bg-white hover:shadow-md transition mb-4"
//             >
//               <div className="flex items-start justify-between">
//                 <div>
//                   <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
//                     <span className="text-gray-700">
//                       <Users size={16} />
//                     </span>
//                     {task.title}
//                   </h2>
//                   <p className="text-sm text-gray-600 mt-1">
//                     Project:{" "}
//                     <span className="text-gray-700">
//                       {projects.find((p) => p.id === task.project_id)?.name ||
//                         "Unknown"}
//                     </span>{" "}
//                     • Assigned to:{" "}
//                     <span className="text-gray-700">
//                       {employees.find((e) => e.id === task.employee_id)?.name ||
//                         "Unknown"}
//                     </span>
//                   </p>
//                 </div>
//                 <div className="flex gap-2 justify-end items-center">
//                   <Button
//                     variant="outline"
//                     size="sm"
//                     onClick={() => openEditDialog(task)}
//                   >
//                     <Edit className="h-4 w-4" />
//                   </Button>
//                   <Button
//                     variant="destructive"
//                     size="sm"
//                     onClick={() => openDeleteDialog(task)}
//                   >
//                     <Trash className="h-4 w-4" />
//                   </Button>
//                 </div>
//               </div>

//               <p className="mt-4 text-gray-700">{task.description}</p>

//               <div className="flex gap-6 mt-4 text-sm text-gray-600">
//                 <p>
//                   <span className="font-semibold">Start:</span>{" "}
//                   {task.start_date}
//                 </p>
//                 <p>
//                   <span className="font-semibold">Due:</span> {task.due_date}
//                 </p>
//               </div>
//             </div>
//           ))}
//         </div>
//       )}
//     </>
//   );
// };

// export default ManagerTaskManagement;

import { useState, useEffect } from "react";
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
  Users,
  Clock,
  CheckCircle2,
  Filter,
  Download,
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

  // Form state
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

  useEffect(() => {
    fetchMockData();
  }, []);

  const fetchMockData = () => {
    setLoading(true);
    try {
      // Mock projects data
      const mockProjects = [
        {
          id: "1",
          name: "Front End Developer",
          description: "UI/UX development",
          status: "active",
        },
        {
          id: "2",
          name: "Android Testing",
          description: "Mobile app testing",
          status: "active",
        },
        {
          id: "3",
          name: "Machine Learning",
          description: "AI model training",
          status: "active",
        },
      ];
      setProjects(mockProjects);

      // Mock employees data
      const mockEmployees = [
        {
          id: "1",
          name: "Gopi G",
          email: "gopi@example.com",
          department: "Development",
        },
        {
          id: "2",
          name: "Ravi K",
          email: "ravi@example.com",
          department: "Testing",
        },
        {
          id: "3",
          name: "Priya S",
          email: "priya@example.com",
          department: "Design",
        },
      ];
      setEmployees(mockEmployees);

      // Mock tasks data
      const mockTasks = [
        {
          id: "1",
          task_title: "Testing New Schema",
          description: "Test database schema updates",
          estimated_hours: 8,
          start_date: "2024-12-26",
          due_date: "2024-12-27",
          status: "INPROGRESS",
          project_type: "Milestone",
          milestone_recurring: "UI Designer",
          time_logged: "8h",
          projects: { name: "Front End Developer" },
          employees: { name: "Gopi G", email: "gopi@example.com" },
        },
        {
          id: "2",
          task_title: "Build the whole project",
          description: "Complete Android app build",
          estimated_hours: 12,
          start_date: "2024-12-18",
          due_date: "2024-12-20",
          status: "INPROGRESS",
          project_type: "Milestone",
          milestone_recurring: "Build the whole project",
          time_logged: "10h",
          projects: { name: "Android Testing" },
          employees: { name: "Gopi G", email: "gopi@example.com" },
        },
        {
          id: "3",
          task_title: "Home Page",
          description: "Design ML dashboard home page",
          estimated_hours: 6,
          start_date: "2024-12-19",
          due_date: "2024-12-21",
          status: "INPROGRESS",
          project_type: "Fixed",
          milestone_recurring: "Recurring",
          time_logged: "5h",
          projects: { name: "Machine Learning" },
          employees: { name: "Gopi G", email: "gopi@example.com" },
        },
      ];
      setTasks(mockTasks);

      // Mock activities data
      const mockActivities = [
        {
          id: "1",
          status: "INPROGRESS",
          project: "Front End Developer",
          project_type: "Milestone",
          milestone_recurring: "UI Designer",
          freelancer: "Gopi G",
          task: "Testing New Schema",
          date: "2024-12-26",
          time: "12:00 PM - 10:00 AM",
        },
        {
          id: "2",
          status: "INPROGRESS",
          project: "Android Testing",
          project_type: "Milestone",
          milestone_recurring: "Build the whole project",
          freelancer: "Gopi G",
          task: "Task Che",
          date: "2024-12-18",
          time: "4:07 AM - 12:11 PM",
        },
        {
          id: "3",
          status: "INPROGRESS",
          project: "Machine Learning",
          project_type: "Fixed",
          milestone_recurring: "Recurring",
          freelancer: "Gopi G",
          task: "Home Page",
          date: "2024-12-19",
          time: "2:28 AM - 12:30 PM",
        },
        {
          id: "4",
          status: "INPROGRESS",
          project: "Front End Developer",
          project_type: "Milestone",
          milestone_recurring: "test for vt escort",
          freelancer: "Gopi G",
          task: "Another Task 22",
          date: "2024-12-12",
          time: "5:39 AM - 1:43 PM",
        },
        {
          id: "5",
          status: "INPROGRESS",
          project: "Front End Developer",
          project_type: "Milestone",
          milestone_recurring: "create home screen",
          freelancer: "Gopi G",
          task: "Home Page",
          date: "2024-12-25",
          time: "1:15 PM - 4:12 AM",
        },
      ];
      setActivities(mockActivities);
    } catch (error) {
      toast({
        title: "Error fetching data",
        description: "Failed to load mock data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
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
  };

  const handleCreateTask = async () => {
    if (
      (!selectedProject && !showNewProject) ||
      !selectedEmployee ||
      !taskTitle ||
      (showNewProject && !newProjectName)
    ) {
      toast({
        title: "Missing required fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const newTask = {
        id: (tasks.length + 1).toString(),
        task_title: taskTitle,
        description: description,
        estimated_hours: estimatedHours ? parseFloat(estimatedHours) : null,
        start_date: startDate || null,
        due_date: dueDate || null,
        status: "assigned",
        project_type: projectType,
        milestone_recurring: milestoneRecurring,
        time_logged: "0h",
        projects: {
          name: showNewProject
            ? newProjectName
            : projects.find((p) => p.id === selectedProject)?.name,
        },
        employees: {
          name: employees.find((e) => e.id === selectedEmployee)?.name,
          email: employees.find((e) => e.id === selectedEmployee)?.email,
        },
      };

      setTasks([...tasks, newTask]);
      setActivities([
        ...activities,
        {
          id: (activities.length + 1).toString(),
          status: "assigned",
          project: newTask.projects.name,
          project_type: projectType,
          milestone_recurring: milestoneRecurring,
          freelancer: newTask.employees.name,
          task: taskTitle,
          date: new Date().toISOString().split("T")[0],
          time: `${format(new Date(), "hh:mm a")} - ${format(
            new Date(),
            "hh:mm a"
          )}`,
        },
      ]);

      toast({
        title: "Activity created successfully! 🎯",
        description: "The activity has been assigned to the freelancer.",
      });

      resetForm();
      setIsDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error creating activity",
        description: "Failed to create the activity",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      INPROGRESS: {
        variant: "secondary",
        label: "IN PROGRESS",
        color: "bg-blue-500 text-white",
      },
      assigned: {
        variant: "outline",
        label: "ASSIGNED",
        color: "bg-gray-500 text-white",
      },
      completed: {
        variant: "default",
        label: "COMPLETED",
        color: "bg-green-500 text-white",
      },
      on_hold: {
        variant: "destructive",
        label: "ON HOLD",
        color: "bg-red-500 text-white",
      },
    };

    const config = variants[status] || variants.assigned;
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const getProjectTypeBadge = (type) => {
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
  };

  const filteredActivities = activities.filter((activity) => {
    const matchesSearch =
      searchTerm === "" ||
      activity.project.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.task.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.freelancer.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || activity.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const exportData = () => {
    const csvContent =
      "Status,Project,Project Type,Milestone/Recurring,Freelancer,Task,Date,Time\n" +
      filteredActivities
        .map(
          (a) =>
            `${a.status},${a.project},${a.project_type},${a.milestone_recurring},${a.freelancer},${a.task},${a.date},${a.time}`
        )
        .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "activities_report.csv";
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Success",
      description: "Activities report exported successfully",
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
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
                <DialogTitle>Add New Activity</DialogTitle>
                <DialogDescription>
                  Create and assign a new activity to a freelancer.
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
                            {projects.map((project) => (
                              <SelectItem key={project.id} value={project.id}>
                                {project.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setShowNewProject(true)}
                          className="w-full"
                        >
                          + Create New Project
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Input
                          placeholder="Enter new project name"
                          value={newProjectName}
                          onChange={(e) => setNewProjectName(e.target.value)}
                        />
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
                    <Label htmlFor="employee">Assign to Freelancer *</Label>
                    <Select
                      value={selectedEmployee}
                      onValueChange={setSelectedEmployee}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a freelancer" />
                      </SelectTrigger>
                      <SelectContent>
                        {employees.map((employee) => (
                          <SelectItem key={employee.id} value={employee.id}>
                            {employee.name} ({employee.department})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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

                <div className="space-y-2">
                  <Label htmlFor="task-title">Task Title *</Label>
                  <Input
                    id="task-title"
                    placeholder="Enter task title"
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                  />
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
                    onClick={handleCreateTask}
                    disabled={loading}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    {loading ? "Creating..." : "Create Activity"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <TabsContent value="activities" className="space-y-4">
          {/* Search and Filters */}
          <div className="flex gap-4 items-center">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
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
                <SelectItem value="INPROGRESS">In Progress</SelectItem>
                <SelectItem value="assigned">Assigned</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="on_hold">On Hold</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={exportData}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>

          {/* Activities Table */}
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
                        Date
                      </TableHead>
                      <TableHead className="font-semibold text-black">
                        Time
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
                          <TableCell>
                            {getStatusBadge(activity.status)}
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
                          <TableCell>
                            {format(new Date(activity.date), "yyyy-MM-dd")}
                          </TableCell>
                          <TableCell className="font-mono text-sm">
                            {activity.time}
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                  Edit Activity
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-red-600">
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
            {projects.length === 0 ? (
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
                {projects.map((project) => (
                  <Card
                    key={project.id}
                    className="hover:shadow-lg transition-shadow"
                  >
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        {project.name}
                        <Badge variant="outline">{project.status}</Badge>
                      </CardTitle>
                      <CardDescription>{project.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">
                          {
                            tasks.filter(
                              (t) => t.projects.name === project.name
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
