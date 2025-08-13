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
} from "lucide-react";
import { useDispatch } from "react-redux";
import { logout } from "@/redux/features/auth/authSlice";
import axiosInstance from "../../services/axiosInstance";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [projects, setProjects] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [rates, setRates] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [newProject, setNewProject] = useState({
    name: "",
    description: "",
    status: "active",
    start_date: "",
    end_date: "",
  });

  const [newEmployee, setNewEmployee] = useState({
    name: "",
    email: "",
    department: "",
    position: "",
    employee_id: "",
  });

  const [rateForm, setRateForm] = useState({
    employee_id: "",
    hourly_rate: "",
    currency: "INR",
  });

  const [activeTab, setActiveTab] = useState("overview");
  const [showProjectDialog, setShowProjectDialog] = useState(false);
  const [showEmployeeDialog, setShowEmployeeDialog] = useState(false);
  const [showRateDialog, setShowRateDialog] = useState(false);
  const [editingProject, setEditingProject] = useState(null);

  useEffect(() => {
    checkAdminRole();
    fetchData();
  }, []);

  const checkAdminRole = async () => {
    // Mock role check (replace with actual auth logic if needed)
    const role = "admin";
    if (role !== "admin") {
      navigate("/access-denied");
    }
  };

  const fetchData = async () => {
    try {
      const projectResponse = await axiosInstance.get("/api/v1/project");
      console.log("Fetched projects:", projectResponse.data.projects); // Debug log
      setProjects(projectResponse.data.projects || []);
      // ... rest of the fetchData code ...
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      });
    } finally {
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
        status: newProject.status || "Active", // Match backend ENUM case
        start_date: newProject.start_date,
        end_date: newProject.end_date,
      };

      const response = await axiosInstance.post(
        "/api/v1/project/create",
        payload
      );

      const createdProject = response.data.project || response.data; // Adjust if controller wraps project in an object

      setProjects((prevProjects) => [createdProject, ...prevProjects]);

      setNewProject({
        name: "",
        description: "",
        status: "Active",
        start_date: "",
        end_date: "",
      });
      setShowProjectDialog(false);

      toast({
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
      console.error("No project selected for update:", editingProject);
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
        status: newProject.status || "Active", // Match backend ENUM
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
        status: "Active",
        start_date: "",
        end_date: "",
      });
      setShowProjectDialog(false);

      toast({
        title: "Success",
        description: "Project updated successfully",
      });
    } catch (error) {
      console.error("Error updating project:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      toast({
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
      // Refresh projects after deletion
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

  const createEmployee = async () => {
    if (!newEmployee.name.trim() || !newEmployee.email.trim()) {
      toast({
        title: "Error",
        description: "Name and email are required",
        variant: "destructive",
      });
      return;
    }

    try {
      const newEmp = {
        id: Date.now().toString(),
        ...newEmployee,
        status: "active",
      };
      setEmployees([newEmp, ...employees]);
      setNewEmployee({
        name: "",
        email: "",
        department: "",
        position: "",
        employee_id: "",
      });
      setShowEmployeeDialog(false);

      toast({
        title: "Success",
        description: "Employee created successfully",
      });
    } catch (error) {
      console.error("Error creating employee:", error);
      toast({
        title: "Error",
        description: "Failed to create employee",
        variant: "destructive",
      });
    }
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
    console.log("Opening project for edit:", project);
    setEditingProject(project);
    setNewProject({
      name: project.name || "",
      description: project.description || "",
      status: project.status || "Active",
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
      status: "Active",
      start_date: "",
      end_date: "",
    });
    setShowProjectDialog(true);
  };

  const handleLogout = () => {
    dispatch(logout());
    toast.success("Logout successful.");
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
            <div>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut />
                Sign Out
              </Button>
              <NotificationSystem />
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto px-4 py-6">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Total Projects
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {projects.length}
                  </p>
                </div>
                <FolderPlus className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Total Employees
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {employees.length}
                  </p>
                </div>
                <Users className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Active Projects
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {projects.filter((p) => p.status === "Active").length}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Rate Configs
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {rates.length}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-8 md:grid-cols-4 lg:grid-cols-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
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
            <div className="text-center py-8">
              <h2 className="text-xl font-semibold mb-4">Admin Overview</h2>
              <p className="text-muted-foreground">
                Use the tabs above to manage different aspects of the system.
              </p>
            </div>
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
                        value={newProject.status || "Active"} // default matches ENUM
                        onValueChange={(value) => {
                          console.log("Selected status:", value);
                          setNewProject({ ...newProject, status: value });
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Active">Active</SelectItem>
                          <SelectItem value="Completed">Completed</SelectItem>
                          <SelectItem value="On Hold">On Hold</SelectItem>
                          <SelectItem value="Cancelled">Cancelled</SelectItem>
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
              {console.log("Rendering projects:", projects)} {/* Debug log */}
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
                            {project.status || "Unknown"}
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
                open={showEmployeeDialog}
                onOpenChange={setShowEmployeeDialog}
              >
                <DialogTrigger asChild>
                  <Button>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add Employee
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Employee</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="emp-name">Full Name</Label>
                      <Input
                        id="emp-name"
                        value={newEmployee.name}
                        onChange={(e) =>
                          setNewEmployee({
                            ...newEmployee,
                            name: e.target.value,
                          })
                        }
                        placeholder="Enter full name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="emp-email">Email</Label>
                      <Input
                        id="emp-email"
                        type="email"
                        value={newEmployee.email}
                        onChange={(e) =>
                          setNewEmployee({
                            ...newEmployee,
                            email: e.target.value,
                          })
                        }
                        placeholder="Enter email address"
                      />
                    </div>
                    <div>
                      <Label htmlFor="emp-id">Employee ID</Label>
                      <Input
                        id="emp-id"
                        value={newEmployee.employee_id}
                        onChange={(e) =>
                          setNewEmployee({
                            ...newEmployee,
                            employee_id: e.target.value,
                          })
                        }
                        placeholder="Enter employee ID"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="emp-dept">Department</Label>
                        <Input
                          id="emp-dept"
                          value={newEmployee.department}
                          onChange={(e) =>
                            setNewEmployee({
                              ...newEmployee,
                              department: e.target.value,
                            })
                          }
                          placeholder="Enter department"
                        />
                      </div>
                      <div>
                        <Label htmlFor="emp-position">Position</Label>
                        <Input
                          id="emp-position"
                          value={newEmployee.position}
                          onChange={(e) =>
                            setNewEmployee({
                              ...newEmployee,
                              position: e.target.value,
                            })
                          }
                          placeholder="Enter position"
                        />
                      </div>
                    </div>
                    <Button onClick={createEmployee} className="w-full">
                      Add Employee
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-4">
              {employees.map((employee) => (
                <Card key={employee.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-foreground">
                          {employee.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {employee.email}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {employee.position} • {employee.department}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          ID: {employee.employee_id}
                        </p>
                      </div>
                      <Badge
                        variant={
                          employee.status === "active" ? "default" : "secondary"
                        }
                      >
                        {employee.status}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
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
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="rate-amount">Hourly Rate</Label>
                        <Input
                          id="rate-amount"
                          type="number"
                          step="0.01"
                          value={rateForm.hourly_rate}
                          onChange={(e) =>
                            setRateForm({
                              ...rateForm,
                              hourly_rate: e.target.value,
                            })
                          }
                          placeholder="0.00"
                        />
                      </div>
                      <div>
                        <Label htmlFor="rate-currency">Currency</Label>
                        <Select
                          value={rateForm.currency}
                          onValueChange={(value) =>
                            setRateForm({ ...rateForm, currency: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="INR">INR (₹)</SelectItem>
                            <SelectItem value="USD">USD ($)</SelectItem>
                            <SelectItem value="EUR">EUR (€)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
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
                            {new Date(rate.effective_from).toLocaleDateString()}
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
