import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import NotificationSystem from "./NotificationSystem";
import TimesheetApproval from "../../components/TimesheetApproval";
import ProjectAssignmentComponent from "../../components/ProjectAssignmentComponent";
import AdminAnalytics from "../../components/AdminAnalytics";
import TimeLogs from "../../components/TimeLogs";
import ApprovalRules from "../../components/ApprovalRules";
import ExportFunctionality from "../../components/ExportFunctionality";
import EmployeeRoleManagement from "../../components/EmployeeRoleManagement ";
import BillableTagsSystem from "../../components/BillableTagsSystem";
import HolidayLeaveCalendar from "../../components/HolidayLeaveCalendar";
import TimesheetBackupRestore from "../../components/TimesheetBackupRestore";
import DuplicateBillingDetection from "../../components/DuplicateBillingDetection";
import {
  Users,
  FolderPlus,
  DollarSign,
  Settings,
  Edit,
  Trash2,
  Plus,
  UserPlus,
  Calendar,
  Clock,
  TrendingUp,
  AlertCircle,
  BarChart3,
  Target,
  CheckCircle,
  LogOut,
  Search,
} from "lucide-react";
import { useDispatch } from "react-redux";
import { logout } from "@/redux/features/auth/authSlice";
import axiosInstance from "../../services/axiosInstance";
import DashboardOverview from "../../components/DashboardOverview";
import TimeTrackingReport from "../../components/TimeTrackingReport";
import TimeTrackingDashboard from "../../components/TimeTrackingDashboard";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [projects, setProjects] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [rates, setRates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [openEmployeeDialog, setOpenEmployeeDialog] = useState(false);
  const [editEmployeeDialog, setEditEmployeeDialog] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);
  const [editingEmployeeId, setEditingEmployeeId] = useState(null);

  // Form states
  const [newProject, setNewProject] = useState({
    name: "",
    description: "",
    status: "active",
    start_date: "",
    end_date: "",
  });

  const [employeeData, setEmployeeData] = useState({
    employee_id: "",
    name: "",
    email: "",
    department: "",
    position: "",
    status: "active",
  });

  const [rateForm, setRateForm] = useState({
    employee_id: "",
    currency: "INR",
  });

  const [activeTab, setActiveTab] = useState("overview");
  const [showProjectDialog, setShowProjectDialog] = useState(false);
  const [showRateDialog, setShowRateDialog] = useState(false);
  const [editingProject, setEditingProject] = useState(null);

  useEffect(() => {
    checkAdminRole();
    fetchData();
  }, [search]);

  const checkAdminRole = async () => {
    const role = "admin";
    if (role !== "admin") {
      navigate("/access-denied");
    }
  };

  const fetchData = async () => {
    try {
      setTableLoading(true);
      const projectResponse = await axiosInstance.get("/api/v1/project");
      setProjects(projectResponse.data.projects || []);

      const employeeResponse = await axiosInstance.get("/api/v1/employee", {
        params: { search },
      });
      setEmployees(employeeResponse.data.employees || []);

      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      });
    } finally {
      setTableLoading(false);
      setLoading(false);
    }
  };

  const createProject = async () => {
    if (!newProject.name.trim()) {
      toast({
        title: "Error",
        description: "Project name is required",
        variant: "destructive",
      });
      return;
    }

    try {
      const payload = {
        name: newProject.name,
        description: newProject.description,
        status: newProject.status || "active",
        start_date: newProject.start_date,
        end_date: newProject.end_date,
      };

      const response = await axiosInstance.post(
        "/api/v1/project/create",
        payload
      );

      const createdProject = response.data.project || response.data;
      setProjects((prevProjects) => [createdProject, ...prevProjects]);

      setNewProject({
        name: "",
        description: "",
        status: "active",
        start_date: "",
        end_date: "",
      });
      setShowProjectDialog(false);

      toast.success({
        title: "Success",
        description: "Project created successfully",
      });
    } catch (error) {
      console.error("Error creating project:", error);
      toast({
        title: "Error",
        description: "Failed to create project",
        variant: "destructive",
      });
    }
  };

  const updateProject = async () => {
    if (!editingProject || !editingProject.id) {
      toast({
        title: "Error",
        description: "No project selected for update",
        variant: "destructive",
      });
      return;
    }

    try {
      const payload = {
        name: newProject.name,
        description: newProject.description,
        status: newProject.status || "active",
        start_date: newProject.start_date,
        end_date: newProject.end_date,
      };

      const response = await axiosInstance.patch(
        `/api/v1/project/${editingProject.id}`,
        payload
      );

      const updatedProject = response.data.project || response.data;

      setProjects((prevProjects) =>
        prevProjects.map((project) =>
          project.id === editingProject.id ? updatedProject : project
        )
      );

      setEditingProject(null);
      setNewProject({
        name: "",
        description: "",
        status: "active",
        start_date: "",
        end_date: "",
      });
      setShowProjectDialog(false);

      toast.success({
        title: "Success",
        description: "Project updated successfully",
      });
    } catch (error) {
      console.error("Error updating project:", error);
      toast.error({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to update project",
        variant: "destructive",
      });
    }
  };

  const deleteProject = async (projectId) => {
    try {
      await axiosInstance.delete(`/api/v1/project/${projectId}`);
      await fetchData();

      toast({
        title: "Success",
        description: "Project deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting project:", error);
      toast({
        title: "Error",
        description: "Failed to delete project",
        variant: "destructive",
      });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEmployeeData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    if (!employeeData.name.trim() || !employeeData.email.trim()) {
      toast({
        title: "Error",
        description: "Name and email are required",
        variant: "destructive",
      });
      return;
    }

    try {
      const payload = {
        employeeId: employeeData.employee_id,
        name: employeeData.name,
        email: employeeData.email,
        department: employeeData.department,
        position: employeeData.position,
        status: employeeData.status,
        userId: 1, // Assuming a default userId, adjust based on auth context
      };

      const response = await axiosInstance.post(
        "/api/v1/employee/add",
        payload
      );
      setEmployees((prev) => [response.data, ...prev]);

      resetEmployeeForm();
      setOpenEmployeeDialog(false);

      toast.success({
        title: "Success",
        description: "Employee added successfully",
      });
    } catch (error) {
      console.error("Error creating employee:", error);
      toast.error({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to create employee",
        variant: "destructive",
      });
    }
  };

  const handleEditEmployee = async (e) => {
    e.preventDefault();
    if (!editingEmployeeId) {
      toast({
        title: "Error",
        description: "No employee selected for update",
        variant: "destructive",
      });
      return;
    }

    try {
      const payload = {
        employee_id: employeeData.employee_id,
        name: employeeData.name,
        email: employeeData.email,
        department: employeeData.department,
        position: employeeData.position,
        status: employeeData.status,
      };

      const response = await axiosInstance.patch(
        `/api/v1/employee/${editingEmployeeId}`,
        payload
      );

      const updatedEmployee = response.data.employee || response.data;

      setEmployees((prev) =>
        prev.map((emp) =>
          emp.id === editingEmployeeId ? { ...emp, ...updatedEmployee } : emp
        )
      );

      resetEmployeeForm();
      setEditEmployeeDialog(false);

      toast.success({
        title: "Success",
        description: "Employee updated successfully",
      });

      // Log the updated employee to verify
      console.log("Updated employee:", updatedEmployee);
    } catch (error) {
      console.error("Error updating employee:", error);
      toast.error({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to update employee",
        variant: "destructive",
      });
    }
  };

  const confirmDeleteEmployee = async () => {
    if (!employeeToDelete) return;

    try {
      await axiosInstance.delete(`/api/v1/employee/${employeeToDelete}`);
      setEmployees((prev) => prev.filter((emp) => emp.id !== employeeToDelete));

      toast.success({
        title: "Success",
        description: "Employee deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting employee:", error);
      toast.error({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to delete employee",
        variant: "destructive",
      });
    } finally {
      setDeleteConfirmOpen(false);
      setEmployeeToDelete(null);
    }
  };

  const resetEmployeeForm = () => {
    setEmployeeData({
      employee_id: "",
      name: "",
      email: "",
      department: "",
      position: "",
      hourly_rate: "",
      status: "active",
    });
    setEditingEmployeeId(null);
  };

  const handleEditClick = (emp) => {
    setEditingEmployeeId(emp.id);
    setEmployeeData({
      employee_id: emp.employee_id || "",
      name: emp.name || "",
      email: emp.email || "",
      department: emp.department || "",
      position: emp.position || "",
      status: emp.status || "active",
    });
    setEditEmployeeDialog(true);
  };

  const setEmployeeRate = async () => {
    if (!rateForm.employee_id || !rateForm.hourly_rate) {
      toast({
        title: "Error",
        description: "Employee and rate are required",
        variant: "destructive",
      });
      return;
    }

    try {
      const newRate = {
        id: Date.now().toString(),
        employee_id: rateForm.employee_id,
        hourly_rate: parseFloat(rateForm.hourly_rate),
        currency: rateForm.currency,
        effective_from: new Date().toISOString().split("T")[0],
      };
      setRates([newRate, ...rates]);
      setRateForm({
        employee_id: "",
        hourly_rate: "",
        currency: "INR",
      });
      setShowRateDialog(false);

      toast({
        title: "Success",
        description: "Employee rate set successfully",
      });
    } catch (error) {
      console.error("Error setting rate:", error);
      toast({
        title: "Error",
        description: "Failed to set employee rate",
        variant: "destructive",
      });
    }
  };

  const openEditProject = (project) => {
    setEditingProject(project);
    setNewProject({
      name: project.name || "",
      description: project.description || "",
      status: project.status || "active",
      start_date: project.start_date || "",
      end_date: project.end_date || "",
    });
    setShowProjectDialog(true);
  };

  const openCreateProject = () => {
    setEditingProject(null);
    setNewProject({
      name: "",
      description: "",
      status: "active",
      start_date: "",
      end_date: "",
    });
    setShowProjectDialog(true);
  };

  const handleLogout = () => {
    dispatch(logout());
    toast({
      title: "Success",
      description: "Logout successful.",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">
            Loading admin dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Admin Dashboard
              </h1>
              <p className="text-muted-foreground">
                Manage projects, employees, and rates
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
              <NotificationSystem />
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto px-4 py-6">
        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-8 md:grid-cols-5 lg:grid-cols-10">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="tracking">Tracking</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="timesheets">Timesheets</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="assignments">Assignments</TabsTrigger>
            <TabsTrigger value="employees">Employees</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
            <TabsTrigger value="admin">Admin Tools</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <DashboardOverview />
          </TabsContent>

          <TabsContent value="tracking" className="space-y-6">
            <TimeTrackingDashboard />
          </TabsContent>

          {/* Time Tracking Report Tab */}
          <TabsContent value="reports" className="space-y-6">
            <TimeTrackingReport />
          </TabsContent>

          {/* Timesheets Tab */}
          <TabsContent value="timesheets" className="space-y-6">
            <TimesheetApproval userRole="admin" />
          </TabsContent>

          {/* Projects Tab */}
          <TabsContent value="projects" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-foreground">
                Projects
              </h2>
              <Dialog
                open={showProjectDialog}
                onOpenChange={setShowProjectDialog}
              >
                <DialogTrigger asChild>
                  <Button onClick={openCreateProject}>
                    <Plus className="h-4 w-4 mr-2" />
                    New Project
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {editingProject ? "Edit Project" : "Create New Project"}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="project-name">Project Name</Label>
                      <Input
                        id="project-name"
                        value={newProject.name || ""}
                        onChange={(e) =>
                          setNewProject({ ...newProject, name: e.target.value })
                        }
                        placeholder="Enter project name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="project-description">Description</Label>
                      <Textarea
                        id="project-description"
                        value={newProject.description || ""}
                        onChange={(e) =>
                          setNewProject({
                            ...newProject,
                            description: e.target.value,
                          })
                        }
                        placeholder="Enter project description"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="start-date">Start Date</Label>
                        <Input
                          id="start-date"
                          type="date"
                          value={newProject.start_date || ""}
                          onChange={(e) =>
                            setNewProject({
                              ...newProject,
                              start_date: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="end-date">End Date</Label>
                        <Input
                          id="end-date"
                          type="date"
                          value={newProject.end_date || ""}
                          onChange={(e) =>
                            setNewProject({
                              ...newProject,
                              end_date: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="project-status">Status</Label>
                      <Select
                        value={newProject.status || "active"}
                        onValueChange={(value) =>
                          setNewProject({ ...newProject, status: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="on_hold">On Hold</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button
                      onClick={editingProject ? updateProject : createProject}
                      className="w-full"
                    >
                      {editingProject ? "Update Project" : "Create Project"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-4">
              {projects.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No projects found
                </div>
              ) : (
                projects.map((project) => (
                  <Card key={project.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">
                          {project.name || "Unnamed Project"}
                        </CardTitle>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              project.status === "active"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {project.status || "unknown"}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditProject(project)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteProject(project.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground mb-2">
                        {project.description || "No description"}
                      </p>
                      <div className="flex gap-4 text-sm text-muted-foreground">
                        {project.start_date && (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Start:{" "}
                            {new Date(project.start_date).toLocaleDateString()}
                          </span>
                        )}
                        {project.end_date && (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            End:{" "}
                            {new Date(project.end_date).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Assignments Tab */}
          <TabsContent value="assignments" className="space-y-6">
            <ProjectAssignmentComponent />
          </TabsContent>

          {/* Employees Tab */}
          <TabsContent value="employees" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-foreground">
                Employees
              </h2>
              <Dialog
                open={openEmployeeDialog}
                onOpenChange={setOpenEmployeeDialog}
              >
                <DialogTrigger asChild>
                  <Button>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add Employee
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle>Add New Employee</DialogTitle>
                    <DialogDescription className="text-gray-500">
                      Enter the employee details below.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleAddEmployee} className="space-y-4">
                    <div className="flex flex-col gap-2">
                      <div>
                        <Label
                          htmlFor="employee_id"
                          className="text-gray-700 font-medium capitalize"
                        >
                          Employee ID
                        </Label>
                        <Input
                          id="employee_id"
                          name="employee_id"
                          type="text"
                          placeholder="Enter Employee ID"
                          value={employeeData.employee_id}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div>
                        <Label
                          htmlFor="name"
                          className="text-gray-700 font-medium capitalize"
                        >
                          Name
                        </Label>
                        <Input
                          id="name"
                          name="name"
                          type="text"
                          placeholder="John Doe"
                          value={employeeData.name}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div>
                        <Label
                          htmlFor="email"
                          className="text-gray-700 font-medium capitalize"
                        >
                          Email
                        </Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          placeholder="john@gmail.com"
                          value={employeeData.email}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div>
                        <Label
                          htmlFor="department"
                          className="text-gray-700 font-medium capitalize"
                        >
                          Department
                        </Label>
                        <Input
                          id="department"
                          name="department"
                          type="text"
                          placeholder="Engineering"
                          value={employeeData.department}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div>
                        <Label
                          htmlFor="position"
                          className="text-gray-700 font-medium capitalize"
                        >
                          Position
                        </Label>
                        <Input
                          id="position"
                          name="position"
                          type="text"
                          placeholder="Software Engineer"
                          value={employeeData.position}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div>
                        <Label
                          htmlFor="status"
                          className="text-gray-700 font-medium capitalize"
                        >
                          Status
                        </Label>
                        <Select
                          value={employeeData.status}
                          onValueChange={(value) =>
                            setEmployeeData({ ...employeeData, status: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <Button type="submit" className="w-full">
                      Add Employee
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="relative mt-6 flex items-center gap-3 max-w-[350px]">
              <Input
                placeholder="Search Employee"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pr-10"
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>

            <div className="mt-6 overflow-x-auto rounded-lg border border-gray-200">
              {tableLoading ? (
                <div className="min-h-screen flex items-center justify-center">
                  <div className="text-center">
                    <Clock className="h-8 w-8 animate-spin mx-auto mb-4" />
                    <p>Loading employees...</p>
                  </div>
                </div>
              ) : (
                <table className="w-full border-collapse text-left">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="border p-3 text-gray-600">Employee ID</th>
                      <th className="border p-3 text-gray-600">Name</th>
                      <th className="border p-3 text-gray-600">Email</th>
                      <th className="border p-3 text-gray-600">Department</th>
                      <th className="border p-3 text-gray-600">Position</th>
                      <th className="border p-3 text-gray-600">Status</th>
                      <th className="border p-3 text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employees.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="text-center p-6">
                          No Employees Found
                        </td>
                      </tr>
                    ) : (
                      employees
                        .filter((emp) =>
                          emp.name.toLowerCase().includes(search.toLowerCase())
                        )
                        .map((emp) => (
                          <tr key={emp.id} className="hover:bg-gray-50">
                            <td className="border p-3">{emp.employee_id}</td>
                            <td className="border p-3">{emp.name}</td>
                            <td className="border p-3">{emp.email}</td>
                            <td className="border p-3">{emp.department}</td>
                            <td className="border p-3">{emp.position}</td>
                            <td className="border p-3 capitalize">
                              <Button
                                size="sm"
                                variant={
                                  emp.status === "active"
                                    ? "outline"
                                    : "secondary"
                                }
                              >
                                {emp.status}
                              </Button>
                            </td>
                            <td className="border p-3 flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEditClick(emp)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setEmployeeToDelete(emp.id);
                                  setDeleteConfirmOpen(true);
                                }}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </td>
                          </tr>
                        ))
                    )}
                  </tbody>
                </table>
              )}
            </div>

            {/* Edit Employee Dialog */}
            <Dialog
              open={editEmployeeDialog}
              onOpenChange={setEditEmployeeDialog}
            >
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Edit Employee</DialogTitle>
                  <DialogDescription className="text-gray-500">
                    Update employee details below.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleEditEmployee} className="space-y-4">
                  <div className="flex flex-col gap-2">
                    <div>
                      <Label
                        htmlFor="employee_id"
                        className="text-gray-700 font-medium capitalize"
                      >
                        Employee ID
                      </Label>
                      <Input
                        id="employee_id"
                        name="employee_id"
                        type="text"
                        placeholder="Enter Employee ID"
                        value={employeeData.employee_id}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div>
                      <Label
                        htmlFor="name"
                        className="text-gray-700 font-medium capitalize"
                      >
                        Name
                      </Label>
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        placeholder="John Doe"
                        value={employeeData.name}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div>
                      <Label
                        htmlFor="email"
                        className="text-gray-700 font-medium capitalize"
                      >
                        Email
                      </Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="john@gmail.com"
                        value={employeeData.email}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div>
                      <Label
                        htmlFor="department"
                        className="text-gray-700 font-medium capitalize"
                      >
                        Department
                      </Label>
                      <Input
                        id="department"
                        name="department"
                        type="text"
                        placeholder="Engineering"
                        value={employeeData.department}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div>
                      <Label
                        htmlFor="position"
                        className="text-gray-700 font-medium capitalize"
                      >
                        Position
                      </Label>
                      <Input
                        id="position"
                        name="position"
                        type="text"
                        placeholder="Software Engineer"
                        value={employeeData.position}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div>
                      <Label
                        htmlFor="status"
                        className="text-gray-700 font-medium capitalize"
                      >
                        Status
                      </Label>
                      <Select
                        value={employeeData.status}
                        onValueChange={(value) =>
                          setEmployeeData({ ...employeeData, status: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button type="submit" className="w-full">
                    Update Employee
                  </Button>
                </form>
              </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog
              open={deleteConfirmOpen}
              onOpenChange={setDeleteConfirmOpen}
            >
              <DialogContent className="sm:max-w-[400px]">
                <DialogHeader>
                  <DialogTitle>Confirm Delete</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to delete this employee? This action
                    cannot be undone.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter className="flex justify-end gap-4">
                  <Button
                    variant="outline"
                    onClick={() => setDeleteConfirmOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button variant="destructive" onClick={confirmDeleteEmployee}>
                    Delete
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </TabsContent>

          {/* Rates Tab */}
          <TabsContent value="rates" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-foreground">
                Employee Rates
              </h2>
              <Dialog open={showRateDialog} onOpenChange={setShowRateDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <DollarSign className="h-4 w-4 mr-2" />
                    Set Rate
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Set Employee Rate</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="rate-employee">Employee</Label>
                      <Select
                        value={rateForm.employee_id}
                        onValueChange={(value) =>
                          setRateForm({ ...rateForm, employee_id: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select an employee" />
                        </SelectTrigger>
                        <SelectContent>
                          {employees.map((employee) => (
                            <SelectItem key={employee.id} value={employee.id}>
                              {employee.name} ({employee.email})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4"></div>
                    <Button onClick={setEmployeeRate} className="w-full">
                      Set Rate
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-4">
              {rates.map((rate) => {
                const employee = employees.find(
                  (e) => e.id === rate.employee_id
                );
                return (
                  <Card key={rate.id}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-foreground">
                            {employee?.name || "Unknown Employee"}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {employee?.email}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Effective from:{" "}
                            {new Date(rate.effective_from)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-foreground">
                            {rate.currency === "INR"
                              ? "₹"
                              : rate.currency === "USD"
                              ? "$"
                              : "€"}
                            {rate.hourly_rate}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            per hour
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <AdminAnalytics />
          </TabsContent>

          {/* Advanced Tab */}
          <TabsContent value="advanced" className="space-y-6">
            <div className="grid gap-6">
              <TimeLogs />
              <ApprovalRules />
              <ExportFunctionality />
            </div>
          </TabsContent>

          {/* Admin Tools Tab */}
          <TabsContent value="admin" className="space-y-6">
            <div className="grid gap-6">
              <EmployeeRoleManagement />
              <BillableTagsSystem />
              <HolidayLeaveCalendar />
              <TimesheetBackupRestore />
              <DuplicateBillingDetection />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
