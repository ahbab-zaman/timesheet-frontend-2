import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loader2, AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import axiosInstance from "@/services/axiosInstance";

const ManagerTask = () => {
  const [tasks, setTasks] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProject, setSelectedProject] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [currentUser, setCurrentUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    estimated_hours: "",
    start_date: "",
    due_date: "",
    project_id: "",
    employee_id: "",
    manager_name: "",
    status: "IN PROGRESS",
  });
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingTaskId, setDeletingTaskId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const authHeaders = {
    Authorization: `Bearer ${localStorage.getItem("authToken")}`,
  };

  const fetchCurrentUser = async () => {
    try {
      const response = await axiosInstance.get("api/v1/auth/manager");
      setCurrentUser(response.data.user);
    } catch (err) {
      console.error("Failed to fetch current user");
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await axiosInstance.get(`/api/v1/project`, {
        headers: authHeaders,
      });
      setProjects(response.data.projects || []);
    } catch (err) {
      console.error("Failed to fetch projects");
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await axiosInstance.get(`/api/v1/employee`, {
        headers: authHeaders,
      });
      setEmployees(response.data.employees || []);
    } catch (err) {
      console.error("Failed to fetch employees");
    }
  };

  const fetchTasks = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get(`/api/v1/task`, {
        params: { limit: 1000 },
        headers: authHeaders,
      });
      setTasks(response.data.tasks || []);
      setTotal(response.data.total || 0);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to fetch tasks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
    fetchProjects();
    fetchEmployees();
  }, []);

  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    if (currentUser) {
      setFormData((prev) => ({
        ...prev,
        manager_name: currentUser.fullName || "",
      }));
    }
  }, [currentUser]);

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      !searchTerm ||
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.project?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.employee?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.manager?.fullName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesProject =
      selectedProject === "all" || task.project?.id == selectedProject;
    const matchesStatus =
      selectedStatus === "all" || task.status === selectedStatus;
    return matchesSearch && matchesProject && matchesStatus;
  });

  const totalFiltered = filteredTasks.length;
  const paginatedTasks = filteredTasks.slice((page - 1) * limit, page * limit);
  const totalPages = Math.ceil(totalFiltered / limit);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      if (editingTask) {
        await axiosInstance.patch(`/api/v1/task/${editingTask.id}`, formData, {
          headers: authHeaders,
        });
      } else {
        await axiosInstance.post(`/api/v1/task/create`, formData, {
          headers: authHeaders,
        });
      }
      fetchTasks();
      setIsModalOpen(false);
      setEditingTask(null);
      setFormData({
        title: "",
        description: "",
        estimated_hours: "",
        start_date: "",
        due_date: "",
        project_id: "",
        employee_id: "",
        manager_name: currentUser?.fullName || "",
        status: "IN PROGRESS",
      });
    } catch (err) {
      setError(err.response?.data?.error || "Failed to save task");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setFormData({
      title: task.title || "",
      description: task.description || "",
      estimated_hours: task.estimated_hours || "",
      start_date: task.start_date || "",
      due_date: task.due_date || "",
      project_id: task.project_id || "",
      employee_id: task.employee_id || "",
      manager_name: task.manager?.fullName || "",
      status: task.status || "IN PROGRESS",
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    setDeletingTaskId(id);
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      await axiosInstance.delete(`/api/v1/task/${deletingTaskId}`, {
        headers: authHeaders,
      });
      fetchTasks();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to delete task");
    } finally {
      setIsDeleting(false);
      setIsDeleteOpen(false);
      setDeletingTaskId(null);
    }
  };

  const statusOptions = ["IN PROGRESS", "COMPLETED", "PENDING"];

  return (
    <Card className="w-full mx-auto mt-8">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-2xl font-bold">Assigned Tasks</CardTitle>
          <Button
            onClick={() => {
              setEditingTask(null);
              setIsModalOpen(true);
            }}
            disabled={isSubmitting}
          >
            Create New Task
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <Input
            placeholder="Search tasks by title, project, employee, or manager..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            className="max-w-sm"
            aria-label="Search tasks"
          />
          <Select
            value={selectedProject}
            onValueChange={(value) => {
              setSelectedProject(value);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Projects" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Projects</SelectItem>
              {projects.map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={selectedStatus}
            onValueChange={(value) => {
              setSelectedStatus(value);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="IN PROGRESS">In Progress</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {loading && (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        )}
        {error && (
          <div className="flex items-center text-red-600 py-4">
            <AlertCircle className="h-5 w-5 mr-2" />
            <span>{error}</span>
          </div>
        )}
        {!loading && !error && totalFiltered === 0 && (
          <p className="text-center text-gray-500 py-4">
            {searchTerm || selectedProject !== "all" || selectedStatus !== "all"
              ? "No tasks found matching your filters."
              : "No tasks assigned to you."}
          </p>
        )}
        {!loading && !error && totalFiltered > 0 && (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[150px]">Title</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Employee</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedTasks.map((task) => (
                  <TableRow key={task.id}>
                    <TableCell className="font-medium">{task.title}</TableCell>
                    <TableCell>{task.project?.name || "N/A"}</TableCell>
                    <TableCell>{task.employee?.name || "N/A"}</TableCell>
                    <TableCell>{task.status}</TableCell>
                    <TableCell>{task.start_date || "N/A"}</TableCell>
                    <TableCell>{task.due_date || "N/A"}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(task)}
                          disabled={isSubmitting || isDeleting}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(task.id)}
                          disabled={isSubmitting || isDeleting}
                        >
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="flex justify-between items-center mt-4 flex-wrap gap-4">
              <p className="text-sm text-gray-600">
                Showing {(page - 1) * limit + 1} to{" "}
                {Math.min(page * limit, totalFiltered)} of {totalFiltered} tasks
              </p>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1 || isSubmitting || isDeleting}
                  aria-label="Previous page"
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setPage(page + 1)}
                  disabled={page === totalPages || isSubmitting || isDeleting}
                  aria-label="Next page"
                >
                  Next
                </Button>
              </div>
            </div>
          </>
        )}

        {/* Create/Edit Modal */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingTask ? "Edit Task" : "Create Task"}
              </DialogTitle>
              <DialogDescription>
                {editingTask
                  ? "Update the task details below."
                  : "Fill in the details to create a new task."}
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Title</label>
                <Input
                  name="title"
                  placeholder="Task title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Estimated Hours</label>
                <Input
                  name="estimated_hours"
                  type="number"
                  placeholder="0"
                  value={formData.estimated_hours}
                  onChange={handleChange}
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Start Date</label>
                <Input
                  name="start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={handleChange}
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Due Date</label>
                <Input
                  name="due_date"
                  type="date"
                  value={formData.due_date}
                  onChange={handleChange}
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  name="description"
                  placeholder="Task description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Project</label>
                <Select
                  value={formData.project_id}
                  onValueChange={(value) =>
                    handleSelectChange("project_id", value)
                  }
                  disabled={isSubmitting}
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
              <div className="space-y-2">
                <label className="text-sm font-medium">Employee</label>
                <Select
                  value={formData.employee_id}
                  onValueChange={(value) =>
                    handleSelectChange("employee_id", value)
                  }
                  disabled={isSubmitting}
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
              <div className="space-y-2">
                <label className="text-sm font-medium">Manager Name</label>
                <Input
                  name="manager_name"
                  placeholder="Manager name"
                  value={formData.manager_name}
                  onChange={handleChange}
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleSelectChange("status", value)}
                  disabled={isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={
                  isSubmitting ||
                  !formData.title ||
                  !formData.project_id ||
                  !formData.employee_id
                }
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {editingTask ? "Updating" : "Creating"}
                  </>
                ) : editingTask ? (
                  "Update"
                ) : (
                  "Create"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the
                task.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirmDelete}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
};

export default ManagerTask;
