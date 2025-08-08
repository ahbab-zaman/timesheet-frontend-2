import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Calendar, Plus, Users, Edit, Trash } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import axiosInstance from "../../services/axiosInstance"; // Adjust path as needed

const ManagerTaskManagement = () => {
  const [tasks, setTasks] = useState([]);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    id: null,
    title: "",
    description: "",
    estimated_hours: "",
    start_date: "",
    due_date: "",
    project_id: "",
    employee_id: "",
  });
  const [dialogMode, setDialogMode] = useState("create"); // "create", "edit", or "delete"

  // Mock data matching database records
  const projects = [
    { id: 1, name: "Project Alpha" },
    { id: 2, name: "Project Beta" },
    { id: 3, name: "Project Gamma" },
  ];
  const employees = [
    { id: 1, name: "John Doe" },
    { id: 2, name: "Jane Smith" },
    { id: 3, name: "Alice Johnson" },
  ];

  // Fetch tasks on component mount
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await axiosInstance.get("/api/v1/task");
        setTasks(response.data.tasks || []);
        setError(null);
      } catch (error) {
        console.error("Error fetching tasks:", error);
        setError("Failed to load tasks. Please try again.");
      }
    };
    fetchTasks();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: parseInt(value, 10) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      formData.title.trim() &&
      formData.estimated_hours &&
      formData.start_date &&
      formData.due_date &&
      formData.project_id &&
      formData.employee_id
    ) {
      try {
        let response;
        if (dialogMode === "create") {
          response = await axiosInstance.post("/api/v1/task/create", {
            ...formData,
            project_id: parseInt(formData.project_id, 10),
            employee_id: parseInt(formData.employee_id, 10),
            estimated_hours: parseInt(formData.estimated_hours, 10),
          });
        } else if (dialogMode === "edit" && formData.id) {
          response = await axiosInstance.patch(`/api/v1/task/${formData.id}`, {
            ...formData,
            project_id: parseInt(formData.project_id, 10),
            employee_id: parseInt(formData.employee_id, 10),
            estimated_hours: parseInt(formData.estimated_hours, 10),
          });
        }
        const tasksResponse = await axiosInstance.get("/api/v1/task");
        setTasks(tasksResponse.data.tasks || []);
        setFormData({
          id: null,
          title: "",
          description: "",
          estimated_hours: "",
          start_date: "",
          due_date: "",
          project_id: "",
          employee_id: "",
        });
        setOpen(false);
        setError(null);
      } catch (error) {
        console.error(
          `Error ${dialogMode === "create" ? "creating" : "updating"} task:`,
          error
        );
        setError(
          `Failed to ${
            dialogMode === "create" ? "create" : "update"
          } task. Ensure IDs are valid.`
        );
      }
    } else {
      setError("Please fill all required fields.");
    }
  };

  const handleDelete = async () => {
    if (formData.id) {
      try {
        await axiosInstance.delete(`/api/v1/task/${formData.id}`);
        const tasksResponse = await axiosInstance.get("/api/v1/task");
        setTasks(tasksResponse.data.tasks || []);
        setFormData({
          id: null,
          title: "",
          description: "",
          estimated_hours: "",
          start_date: "",
          due_date: "",
          project_id: "",
          employee_id: "",
        });
        setOpen(false);
        setDialogMode("create"); // Reset dialog mode after delete
        setError(null);
      } catch (error) {
        console.error("Error deleting task:", error);
        setError("Failed to delete task.");
      }
    }
  };

  const openEditDialog = (task) => {
    setFormData({
      id: task.id,
      title: task.title,
      description: task.description || "",
      estimated_hours: task.estimated_hours,
      start_date: task.start_date,
      due_date: task.due_date,
      project_id: task.project_id,
      employee_id: task.employee_id,
    });
    setDialogMode("edit");
    setOpen(true);
  };

  const openDeleteDialog = (task) => {
    setFormData({ id: task.id });
    setDialogMode("delete");
    setOpen(true);
  };

  const openCreateDialog = () => {
    setFormData({
      id: null,
      title: "",
      description: "",
      estimated_hours: "",
      start_date: "",
      due_date: "",
      project_id: "",
      employee_id: "",
    });
    setDialogMode("create");
    setOpen(true);
  };

  return (
    <>
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">AIREPRO Task Management</h2>
          <p className="text-[#64748B]">
            Create and manage tasks for your team
          </p>
        </div>
        <div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreateDialog}>
                <Plus className="mr-2 h-4 w-4" /> Create Task
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {dialogMode === "create" && "Create New Task"}
                  {dialogMode === "edit" && "Edit Task"}
                  {dialogMode === "delete" && "Confirm Delete"}
                </DialogTitle>
                <DialogDescription>
                  {dialogMode === "create" &&
                    "Fill in the details to create a new task for your team."}
                  {dialogMode === "edit" &&
                    "Update the details for the selected task."}
                  {dialogMode === "delete" &&
                    "Are you sure you want to delete this task? This action cannot be undone."}
                </DialogDescription>
              </DialogHeader>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              {dialogMode !== "delete" ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="flex items-center gap-2 w-full">
                    <div className="w-1/2">
                      <Label htmlFor="project_id">Project</Label>
                      <Select
                        value={formData.project_id || ""}
                        onValueChange={(value) =>
                          handleSelectChange("project_id", value)
                        }
                        required
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
                    <div className="w-1/2">
                      <Label htmlFor="employee_id">Assign to Employee</Label>
                      <Select
                        value={formData.employee_id || ""}
                        onValueChange={(value) =>
                          handleSelectChange("employee_id", value)
                        }
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select employee" />
                        </SelectTrigger>
                        <SelectContent>
                          {employees.map((employee) => (
                            <SelectItem key={employee.id} value={employee.id}>
                              {employee.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="title">Task Title</Label>
                    <Input
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="Enter task title"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Enter task description"
                      className="resize-none"
                    />
                  </div>
                  <div className="flex justify-between items-center gap-3">
                    <div className="space-y-2 w-full">
                      <Label htmlFor="estimated_hours">Estimated Hours</Label>
                      <Input
                        id="estimated_hours"
                        name="estimated_hours"
                        type="number"
                        value={formData.estimated_hours}
                        onChange={handleInputChange}
                        placeholder="Enter hours"
                        required
                      />
                    </div>
                    <div className="space-y-2 w-full">
                      <Label htmlFor="start_date">Start Date</Label>
                      <Input
                        id="start_date"
                        name="start_date"
                        type="date"
                        value={formData.start_date}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="space-y-2 w-full">
                      <Label htmlFor="due_date">Due Date</Label>
                      <Input
                        id="due_date"
                        name="due_date"
                        type="date"
                        value={formData.due_date}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">
                      {dialogMode === "create" && "Create Task"}
                      {dialogMode === "edit" && "Save Changes"}
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <p className="text-gray-600">
                    Are you sure you want to delete the task "
                    {tasks.find((t) => t.id === formData.id)?.title ||
                      "Unknown"}
                    "?
                  </p>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setOpen(false)}>
                      Cancel
                    </Button>
                    <Button variant="destructive" onClick={handleDelete}>
                      <Trash className="mr-2 h-4 w-4" /> Delete
                    </Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>
      {tasks.length === 0 ? (
        <div className="mt-6 text-center">
          <Calendar className="h-12 w-12 mx-auto text-gray-500 mb-4" />
          <h3 className="text-lg font-medium">No tasks found</h3>
          <p className="text-gray-500">Create a task to get started.</p>
        </div>
      ) : (
        <div className="mt-6">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="p-6 border rounded-lg shadow-sm bg-white hover:shadow-md transition mb-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <span className="text-gray-700">
                      <Users size={16} />
                    </span>
                    {task.title}
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Project:{" "}
                    <span className="text-gray-700">
                      {projects.find((p) => p.id === task.project_id)?.name ||
                        "Unknown"}
                    </span>{" "}
                    • Assigned to:{" "}
                    <span className="text-gray-700">
                      {employees.find((e) => e.id === task.employee_id)?.name ||
                        "Unknown"}
                    </span>
                  </p>
                </div>
                <div className="flex gap-2 justify-end items-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditDialog(task)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => openDeleteDialog(task)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <p className="mt-4 text-gray-700">{task.description}</p>

              <div className="flex gap-6 mt-4 text-sm text-gray-600">
                <p>
                  <span className="font-semibold">Start:</span>{" "}
                  {task.start_date}
                </p>
                <p>
                  <span className="font-semibold">Due:</span> {task.due_date}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default ManagerTaskManagement;
